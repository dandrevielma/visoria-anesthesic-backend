export const reminderTemplate = ({
  subject,
  body,
  email,
  schedule,
  unsubscribeUrl,
}: {
  subject: string;
  body: string;
  email: string;
  schedule: string;
  unsubscribeUrl: string;
}) => `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta name="viewport" content="width=device-width" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta
      name="format-detection"
      content="telephone=no,address=no,email=no,date=no,url=no" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <style>
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 400;
        mso-font-alt: 'sans-serif';
        src: url(https://rsms.me/inter/font-files/Inter-Regular.woff2?v=3.19) format('woff2');
      }
      * {
        font-family: 'Inter', sans-serif;
      }
      blockquote,h1,h2,h3,img,li,ol,p,ul{margin-top:0;margin-bottom:0}
      @media only screen and (max-width:425px){
        .tab-row-full{width:100%!important}
        .tab-col-full{display:block!important;width:100%!important}
        .tab-pad{padding:0!important}
      }
    </style>
  </head>
  <body style="background-color:#ffffff">
    <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center">
      <tbody>
        <tr>
          <td style="margin:0;background-color:#ffffff;padding:0">
            <!-- Preheader (shortened) -->
            <div
              style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0"
              data-skip-in-text="true">
              Reminder: ${subject} at ${schedule}
            </div>

            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
              style="max-width:600px;width:100%;margin:auto;background-color:#ffffff;padding:8px">
              <tbody>
                <tr>
                  <td>
                    <!-- Header logo -->
                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
                      style="margin-bottom:32px">
                      <tbody>
                        <tr>
                          <td align="center">
                            <img
                              src="https://nottifai.com/primary-dark.png"
                              alt="Nottifai"
                              style="display:block;width:314px;max-width:100%;border:none" />
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <!-- Title -->
                    <h2 style="margin:0 0 12px 0;text-align:left;color:#111827;font-size:30px;line-height:36px;font-weight:700">
                      Reminder: ${subject} at ${schedule}
                    </h2>

                    <!-- Body -->
                    <h3 style="margin:0;text-align:left;color:#111827;font-size:24px;line-height:38px;font-weight:600">
                      ${body}
                    </h3>

                    <hr style="border:none;border-top:1px solid #eaeaea;margin:32px 0" />

                    <!-- App download -->
                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
                      class="tab-row-full">
                      <tbody>
                        <tr>
                          <td class="tab-col-full" style="text-align:center">
                            <h3 style="margin:0;color:#111827;font-size:24px;line-height:38px;font-weight:600">
                              <strong>Get the Nottifai App</strong>
                            </h3>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-top:12px">
                            <a href="https://nottifai.com" target="_blank">
                              <img
                                src="https://nottifai.com/appstore.png"
                                alt="Download on the App Store"
                                style="display:inline-block;width:194px;height:75px;border:none" />
                            </a>
                            &nbsp;
                            <a href="https://nottifai.com" target="_blank">
                              <img
                                src="https://nottifai.com/playstore.png"
                                alt="Get it on Google Play"
                                style="display:inline-block;width:194px;height:75px;border:none" />
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <hr style="border:none;border-top:1px solid #eaeaea;margin:32px 0" />

                    <!-- Footer text -->
                    <p style="font-size:14px;line-height:24px;color:#64748B;margin:0 0 20px 0">
                      This email was sent to ${email}
                    </p>
                    <p style="font-size:14px;line-height:24px;color:#64748B;margin:0 0 20px 0">
                      To manage your email settings please go in the Nottifai app
                    </p>
                    <p style="font-size:14px;line-height:24px;color:#64748B;margin:0 0 20px 0">
                      📩 This is an automated notification from <strong>Nottifai</strong>. Please do not reply.
                    </p>

                    <hr style="border:none;border-top:1px solid #eaeaea;margin:32px 0" />

                    <!-- Company info + unsubscribe -->
                    <p style="font-size:14px;line-height:24px;color:#64748B;text-align:center;margin:0 0 20px 0">
                      1079 W Round Grove Rd #300 #558, Lewisville, TX 75067, United States<br />
                      <a href="https://nottifai.com" target="_blank" style="color:#64748b;text-decoration:underline">
                        VISIT COMPANY
                      </a>
                      &nbsp;|&nbsp;
                      <a href="${unsubscribeUrl}" target="_blank" style="color:#64748b;text-decoration:underline">
                        UNSUBSCRIBE
                      </a>
                    </p>

                    <!-- Socials -->
                    <p style="text-align:center;margin:0 0 20px 0">
                      <a href="https://www.linkedin.com/in/nottifai" target="_blank">
                        <img src="https://nottifai.com/linkedin.png" width="20" height="20" style="vertical-align:middle;border:none" />
                      </a>&nbsp;
                      <a href="https://www.youtube.com/nottifai" target="_blank">
                        <img src="https://nottifai.com/youtube.png" width="20" height="20" style="vertical-align:middle;border:none" />
                      </a>&nbsp;
                      <a href="https://x.com/nottifai" target="_blank">
                        <img src="https://nottifai.com/twitter.png" width="20" height="20" style="vertical-align:middle;border:none" />
                      </a>
                    </p>

                    <hr style="border:none;border-top:1px solid #eaeaea;margin:32px 0" />

                    <p style="font-size:15px;line-height:26.25px;text-align:center;color:#aaa;margin:0">
                      Nottifai © 2025. All rights reserved.
                    </p>

                  </td>
                </tr>
              </tbody>
            </table>

          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;
