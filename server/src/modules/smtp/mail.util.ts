// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodemailer = require('nodemailer');

export type SmtpTransportConfig = {
  host: string;
  port: string | number;
  user: string;
  pass: string;
};

export const sendEmail = (
  message: Record<string, unknown>,
  { host, port, user, pass }: SmtpTransportConfig,
) => {
  if (!host || !port || !user || !pass) {
    console.log('邮箱配置不正确，无法发送邮件');
    return Promise.reject(new Error('SMTP configuration is incomplete'));
  }

  const portNum = Number(port);
  const secure = portNum === 465;

  const transport = nodemailer.createTransport({
    host,
    port: portNum,
    secure,
    auth: {
      user,
      pass,
    },
    ...(portNum === 587 ? { requireTLS: true } : {}),
  });

  return new Promise((resolve, reject) => {
    transport.sendMail(message, function (err, info) {
      if (err) {
        console.log('发送邮件失败', err);
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
};
