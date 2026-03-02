import { Router, Request, Response } from 'express';
import { db } from '@/lib/db';
import { expressTryCatch } from '@/middleware/globalTryCatch';

const router = Router();

async function syncUserRole(userId: string, role: 'admin' | 'medico' | 'patient') {
  const dbRole = role === 'medico' ? 'doctor' : role === 'admin' ? 'admin' : null;

  await db
    .deleteFrom('user_role')
    .where('user_id', '=', userId)
    .execute();

  if (!dbRole) return;

  await db
    .insertInto('user_role')
    .values({
      user_id: userId,
      role: dbRole,
    })
    .execute();
}

router.get(
  '/',
  expressTryCatch(async (_req: Request, res: Response) => {
    const rows = await db
      .selectFrom('user')
      .leftJoin('user_role', 'user.id', 'user_role.user_id')
      .select([
        'user.id as id',
        'user.name as name',
        'user.email as email',
        'user.createdAt as createdAt',
        'user.updatedAt as updatedAt',
        'user_role.role as dbRole',
      ])
      .orderBy('user.createdAt', 'desc')
      .execute();

    const usersMap = new Map<
      string,
      {
        id: string;
        name: string;
        email: string;
        role: 'admin' | 'medico' | 'patient';
        createdAt: Date | string;
        updatedAt: Date | string;
      }
    >();

    for (const row of rows) {
      if (!usersMap.has(row.id)) {
        usersMap.set(row.id, {
          id: row.id,
          name: row.name,
          email: row.email,
          role: row.dbRole === 'doctor' ? 'medico' : row.dbRole === 'admin' ? 'admin' : 'patient',
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        });
      }
    }

    res.json(Array.from(usersMap.values()));
  })
);

router.post(
  '/',
  expressTryCatch(async (req: Request, res: Response) => {
    const { name, email, role, password } = req.body as {
      name?: string;
      email?: string;
      role?: 'admin' | 'medico' | 'patient';
      password?: string;
    };

    if (!name || !email || !role || !password) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'name, email, role y password son requeridos',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    if (!normalizedName) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'name es requerido',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'email inválido',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'La clave debe tener al menos 8 caracteres',
      });
    }

    const existingUser = await db
      .selectFrom('user')
      .select(['id', 'name', 'email', 'createdAt', 'updatedAt'])
      .where('email', '=', normalizedEmail)
      .executeTakeFirst();

    if (existingUser) {
      await db
        .updateTable('user')
        .set({ emailVerified: 1 })
        .where('id', '=', existingUser.id)
        .execute();

      await syncUserRole(existingUser.id, role);

      return res.status(200).json({
        ...existingUser,
        role,
      });
    }

    const requestOrigin = `${req.protocol}://${req.get('host')}`;

    let signUpResponse: globalThis.Response;
    try {
      signUpResponse = await fetch(`${requestOrigin}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: normalizedName,
          email: normalizedEmail,
          password,
        }),
      });
    } catch (error) {
      return res.status(502).json({
        error: 'Auth service unavailable',
        message:
          error instanceof Error
            ? `No se pudo contactar el servicio de autenticación: ${error.message}`
            : 'No se pudo contactar el servicio de autenticación',
      });
    }

    if (!signUpResponse.ok) {
      let message = 'No se pudo crear el usuario';
      try {
        const errorData = await signUpResponse.json();
        message = errorData?.message || errorData?.error?.message || message;
      } catch (_error) {
        const text = await signUpResponse.text();
        if (text) message = text;
      }

      const createdDespiteError = await db
        .selectFrom('user')
        .select(['id', 'name', 'email', 'createdAt', 'updatedAt'])
        .where('email', '=', normalizedEmail)
        .executeTakeFirst();

      if (!createdDespiteError) {
        return res.status(signUpResponse.status).json({
          error: 'User creation failed',
          message,
        });
      }

      console.warn('[admin-users] signup returned error but user exists, continuing', {
        email: normalizedEmail,
        status: signUpResponse.status,
        message,
      });
    }

    const user = await db
      .selectFrom('user')
      .select(['id', 'name', 'email', 'createdAt', 'updatedAt'])
      .where('email', '=', normalizedEmail)
      .executeTakeFirst();

    if (!user) {
      return res.status(500).json({
        error: 'User creation failed',
        message: 'Usuario creado en auth pero no encontrado en base de datos',
      });
    }

    await db
      .updateTable('user')
      .set({ emailVerified: 1 })
      .where('id', '=', user.id)
      .execute();

    await syncUserRole(user.id, role);

    res.status(201).json({
      ...user,
      role,
    });
  })
);

router.delete(
  '/:id',
  expressTryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'id es requerido',
      });
    }

    const user = await db
      .selectFrom('user')
      .select(['id'])
      .where('id', '=', id)
      .executeTakeFirst();

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Usuario no encontrado',
      });
    }

    await db.deleteFrom('user_role').where('user_id', '=', id).execute();
    await db.deleteFrom('account').where('userId', '=', id).execute();
    await db.deleteFrom('session').where('userId', '=', id).execute();
    await db.deleteFrom('verification').where('identifier', '=', id).execute();
    await db.deleteFrom('user').where('id', '=', id).execute();

    res.json({ message: 'Usuario eliminado exitosamente' });
  })
);

export const adminUsersRouter = router;
