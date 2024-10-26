import { dateFormat } from '../../utils/date.util';

export const getNewCommentHTML = ({
  systemTitle,
  systemUrl,
  adminSystemUrl,
  adminName,
  comment,
}) => {
  return `
  <table
  id="table-parent"
  style="background-color:#ffffff; border:0 none; border-collapse:collapse; mso-table-lspace:0; mso-table-rspace:0"
  bgcolor="#ffffff"
  border="0"
  cellpadding="0"
  cellspacing="0"
  width="100%"
>
  <tbody>
    <tr>
      <td
        id="td-parent"
        style="border-collapse:collapse; font-family:Roboto, Arial, Helvetica, sans-serif; padding:0"
        align="center"
        bgcolor="#ffffff"
      >
        <div
          id="email"
          style="background-color:#ffffff; margin:0 auto; padding:20px 10px"
          bgcolor="#ffffff"
        >
          <table
            class="bodyWrap"
            align="center"
            style="background-color:#f1f3f4;border-collapse:collapse;margin:0;/* border: 2px solid #f1f3f4; */min-width:600px;max-width:600px;width:600px;mso-table-lspace:0;mso-table-rspace:0;padding:0;"
            bgcolor="#f1f3f4"
            border="0"
            cellpadding="0"
            cellspacing="0"
            width="600"
          >
            <tbody>
              <tr>
                <td
                  class="bodyWrap-td"
                  style="border-collapse:collapse;font-family:Roboto, Arial, Helvetica, sans-serif;padding:0;border: 2px solid #f1f3f4;"
                >
                  <table
                    style="width:600px; border:0 none; border-collapse:collapse; mso-table-lspace:0; mso-table-rspace:0"
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    width="600"
                  >
                    <tbody>
                      <tr>
                        <td
                          class="header-content"
                          style="border-collapse:collapse; font-family:Roboto, sans-serif; padding:28px 0;"
                          align="center"
                          bgcolor="#ffffff"
                          valign="top"
                          width="100%"
                          dir="ltr"
                        >
                          <table
                            style="border:0 none; border-collapse:collapse; mso-table-lspace:0; mso-table-rspace:0"
                            align="center"
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            width="100%"
                          >
                            <tbody>
                              <tr>
                                <td
                                  class="logo_updated"
                                  style="border-collapse:collapse; font-family:Roboto, sans-serif; padding-left:20px;"
                                  valign="top"
                                  width="50%"
                                >
                                  <span>${systemTitle}</span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td
                          class="body-content"
                          style="border-collapse:collapse; font-family:Roboto, Arial, Helvetica, sans-serif; padding:20px 20px 20px 20px;background: #f1f3f4;"
                          align="center"
                          valign="top"
                          width="100%"
                        >
                          <table
                            style="border:0 none; border-collapse:collapse; mso-table-lspace:0; mso-table-rspace:0"
                            align="center"
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            width="100%"
                          >
                            <tbody>
                              <tr>
                                <td
                                  class="mod-container-td"
                                  style="border:1px solid #eef0f1; border-collapse:collapse; font-family:Roboto,Arial, Helvetica, sans-serif"
                                  align="center"
                                  bgcolor="#ffffff"
                                  valign="top"
                                  width="100%"
                                >
                                  <table
                                    style="border:0 none; border-collapse:collapse; mso-table-lspace:0; mso-table-rspace:0"
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                    width="100%"
                                  >
                                    <tbody>
                                      <tr>
                                        <td
                                          class="mod-padding"
                                          style="border-collapse:collapse; font-family:Roboto, Arial, Helvetica, sans-serif; padding:25px 30px 0px 30px"
                                          width="100%"
                                        >
                                          <table
                                            style="border:0 none; border-collapse:collapse; mso-table-lspace:0; mso-table-rspace:0"
                                            border="0"
                                            cellpadding="0"
                                            cellspacing="0"
                                            width="100%"
                                          >
                                            <tbody>
                                              <tr>
                                                <td
                                                  dir="ltr"
                                                  class="mod-padding image-title"
                                                  style="border-collapse:collapse; color:#3c4043; font-weight:400; font-family:Google Sans, Roboto, Helvetica, Arial, sans-serif; font-size:30px; line-height:42px; padding: 0px 0px;  padding-bottom:25px;word-break:break-all; direction:ltr;"
                                                  align="center"
                                                  width="100%"
                                                >
                                                  新评论通知
                                                </td>
                                              </tr>

                                              <tr>
                                                <td
                                                  class="bullet-copy "
                                                  style="border-collapse:collapse; color:#5f6368; font-family:Roboto, Arial, Helvetica, sans-serif;direction:ltr; font-size:16px; text-align:left; line-height:26px;word-break:break-all"
                                                  valign="top"
                                                  width="95%"
                                                  dir="ltr"
                                                >
                                                  <p>亲爱的${adminName}，站点收到新评论：</p>
                                                  <p>评论人：<b>${comment.name}</b></p>
                                                  <p>评论内容：<b>${comment.content}</b></p>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td style="padding: 20px 30px 20px 30px;">
                                          <table
                                            width=""
                                            border="0"
                                            cellpadding="0"
                                            cellspacing="0"
                                            align="center"
                                          >
                                            <tbody>
                                              <tr>
                                                <td
                                                  width="240"
                                                  height="41"
                                                  style="text-align:center; white-space: nowrap; background-color: #4285f4; height: 41px; border-radius:3px;"
                                                  dir="ltr"
                                                >
                                                  <div>
                                                    <a
                                                      dir="ltr"
                                                      href="${adminSystemUrl}"
                                                      class="cta-button"
                                                      style="color:#ffffff;display:inline-block;font-family:Roboto, Arial, Helvetica, sans-serif;font-size:16px;font-weight:bold;line-height:35px;text-align:center;text-decoration:none;padding-left:28px;padding-right:28px; padding-bottom:3px;padding-top:3px; -webkit-text-size-adjust:none;white-space: nowrap; word-break:break-all; direction:ltr; min-width:194px;"
                                                      target="_blank"
                                                      >立即处理</a
                                                    >
                                                  </div>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>
                                          <table
                                            class="sign-off"
                                            style="border:0 none; border-collapse:collapse; mso-table-lspace:0; mso-table-rspace:0"
                                            border="0"
                                            cellpadding="0"
                                            cellspacing="0"
                                            width="100%"
                                          >
                                            <tbody>
                                              <tr>
                                                <td
                                                  dir="ltr"
                                                  class="bullet-copy"
                                                  style="border-collapse:collapse; color:#5f6368; font-family:Roboto, Arial, Helvetica, sans-serif; text-align:left; font-size:16px; line-height:26px; direction:ltr; padding:20px 30px 0 30px;word-break:break-all;"
                                                  valign="top"
                                                  width="93%"
                                                >
                                                  此致
                                                </td>
                                              </tr>
                                              <tr>
                                                <td
                                                  dir="ltr"
                                                  style="border-collapse:collapse; color:#5f6368; font-family:Roboto, Arial, Helvetica, sans-serif; font-size:16px; direction:ltr; text-align:left; line-height:26px; word-break:break-all;padding:0px 30px 25px 30px;word-break:break-all;"
                                                  width="93%"
                                                  direction="ltr"
                                                >
                                                  <strong>${systemTitle} 敬上</strong>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td
                  class="footer-content"
                  style="border-collapse:collapse; font-family:Roboto, sans-serif; padding:25px 30px; border: 2px solid #f1f3f4;"
                  align="center"
                  bgcolor="#ffffff"
                  valign="top"
                  width="100%"
                >
                  <table
                    style="border:0 none; border-collapse:collapse; mso-table-lspace:0; mso-table-rspace:0"
                    align="center"
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    width="100%"
                  >
                    <tbody>
                      <tr>
                        <td
                          class="footer-addr"
                          colspan="2"
                          style="border-collapse:collapse; color:#999999;direction:ltr; font-size:10px;line-height:14px; padding:0 0 15px"
                          align="center"
                          valign="top"
                          width="100%"
                        >
                          <span
                            class="ios-link-footer-addr"
                            style="color:#999999; cursor:text; text-decoration:none"
                            ><font
                              ><span
                                style="color:#999999; cursor:text; text-decoration:none; font-family:Roboto, sans-serif;"
                              >
                                <span
                                  style="font-size:inherit; color:inherit; font-weight:inherit; line-height:inherit; font-family:inherit;"
                                  >© ${dateFormat()}</span
                                >
                              </span></font
                            ></span
                          >
                        </td>
                      </tr>
                      <tr>
                        <td
                          colspan="2"
                          class="footer-legal last"
                          style="border-collapse:collapse; color:#999999; font-family:Roboto, sans-serif; font-size:10px;direction:ltr; line-height:14px; padding:0 0 15px; padding-bottom:0;word-break:break-all;"
                          align="center"
                          valign="top"
                          width="100%"
                        >
                          <span style="font-size:inherit; color:inherit;font-weight:inherit;"
                            >我们向您发送这封必读的电子邮件服务通告，目的是让您了解 ${systemUrl}
                            的重要变化。</span
                          >
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  </tbody>
</table>
  `;
};

export const getReplyCommentHTML = ({
  systemLogo,
  systemTitle,
  systemFavicon,
  systemUrl,
  replyUserName,
  commentHostUrl,
}) => {
  return `
  <table
  id="table-parent"
  style="background-color:#ffffff; border:0 none; border-collapse:collapse; mso-table-lspace:0; mso-table-rspace:0"
  bgcolor="#ffffff"
  border="0"
  cellpadding="0"
  cellspacing="0"
  width="100%"
>
  <tbody>
    <tr>
      <td
        id="td-parent"
        style="border-collapse:collapse; font-family:Roboto, Arial, Helvetica, sans-serif; padding:0"
        align="center"
        bgcolor="#ffffff"
      >
        <div
          id="email"
          style="background-color:#ffffff; margin:0 auto; padding:20px 10px"
          bgcolor="#ffffff"
        >
          <table
            class="bodyWrap"
            align="center"
            style="background-color:#f1f3f4;border-collapse:collapse;margin:0;/* border: 2px solid #f1f3f4; */min-width:600px;max-width:600px;width:600px;mso-table-lspace:0;mso-table-rspace:0;padding:0;"
            bgcolor="#f1f3f4"
            border="0"
            cellpadding="0"
            cellspacing="0"
            width="600"
          >
            <tbody>
              <tr>
                <td
                  class="bodyWrap-td"
                  style="border-collapse:collapse;font-family:Roboto, Arial, Helvetica, sans-serif;padding:0;border: 2px solid #f1f3f4;"
                >
                  <table
                    style="width:600px; border:0 none; border-collapse:collapse; mso-table-lspace:0; mso-table-rspace:0"
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    width="600"
                  >
                    <tbody>
                      <tr>
                        <td
                          class="header-content"
                          style="border-collapse:collapse; font-family:Roboto, sans-serif; padding:28px 0;"
                          align="center"
                          bgcolor="#ffffff"
                          valign="top"
                          width="100%"
                          dir="ltr"
                        >
                          <table
                            style="border:0 none; border-collapse:collapse; mso-table-lspace:0; mso-table-rspace:0"
                            align="center"
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            width="100%"
                          >
                            <tbody>
                              <tr>
                                <td
                                  class="logo_updated"
                                  style="border-collapse:collapse; font-family:Roboto, sans-serif; padding-left:20px;"
                                  valign="top"
                                  width="50%"
                                >
                                  <img
                                    alt="${systemTitle}"
                                    src="${systemLogo || systemFavicon}"
                                    style="border:0 none; height:30px; max-height:30px; max-width:auto; width:auto;"
                                    border="0"
                                    width="auto"
                                    height="30"
                                  />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td
                          class="body-content"
                          style="border-collapse:collapse; font-family:Roboto, Arial, Helvetica, sans-serif; padding:20px 20px 20px 20px;background: #f1f3f4;"
                          align="center"
                          valign="top"
                          width="100%"
                        >
                          <table
                            style="border:0 none; border-collapse:collapse; mso-table-lspace:0; mso-table-rspace:0"
                            align="center"
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            width="100%"
                          >
                            <tbody>
                              <tr>
                                <td
                                  class="mod-container-td"
                                  style="border:1px solid #eef0f1; border-collapse:collapse; font-family:Roboto,Arial, Helvetica, sans-serif"
                                  align="center"
                                  bgcolor="#ffffff"
                                  valign="top"
                                  width="100%"
                                >
                                  <table
                                    style="border:0 none; border-collapse:collapse; mso-table-lspace:0; mso-table-rspace:0"
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                    width="100%"
                                  >
                                    <tbody>
                                      <tr>
                                        <td
                                          class="mod-padding"
                                          style="border-collapse:collapse; font-family:Roboto, Arial, Helvetica, sans-serif; padding:25px 30px 0px 30px"
                                          width="100%"
                                        >
                                          <table
                                            style="border:0 none; border-collapse:collapse; mso-table-lspace:0; mso-table-rspace:0"
                                            border="0"
                                            cellpadding="0"
                                            cellspacing="0"
                                            width="100%"
                                          >
                                            <tbody>
                                              <tr>
                                                <td
                                                  dir="ltr"
                                                  class="mod-padding image-title"
                                                  style="border-collapse:collapse; color:#3c4043; font-weight:400; font-family:Google Sans, Roboto, Helvetica, Arial, sans-serif; font-size:30px; line-height:42px; padding: 0px 0px;  padding-bottom:25px;word-break:break-all; direction:ltr;"
                                                  align="center"
                                                  width="100%"
                                                >
                                                  评论回复通知
                                                </td>
                                              </tr>

                                              <tr>
                                                <td
                                                  class="bullet-copy "
                                                  style="border-collapse:collapse; color:#5f6368; font-family:Roboto, Arial, Helvetica, sans-serif;direction:ltr; font-size:16px; text-align:left; line-height:26px;word-break:break-all"
                                                  valign="top"
                                                  width="95%"
                                                  dir="ltr"
                                                >
                                                  <p>亲爱的${replyUserName}，您的评论已经被他人回复。</p>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td style="padding: 20px 30px 20px 30px;">
                                          <table
                                            width=""
                                            border="0"
                                            cellpadding="0"
                                            cellspacing="0"
                                            align="center"
                                          >
                                            <tbody>
                                              <tr>
                                                <td
                                                  width="240"
                                                  height="41"
                                                  style="text-align:center; white-space: nowrap; background-color: #4285f4; height: 41px; border-radius:3px;"
                                                  dir="ltr"
                                                >
                                                  <div>
                                                    <a
                                                      dir="ltr"
                                                      href="${commentHostUrl}"
                                                      class="cta-button"
                                                      style="color:#ffffff;display:inline-block;font-family:Roboto, Arial, Helvetica, sans-serif;font-size:16px;font-weight:bold;line-height:35px;text-align:center;text-decoration:none;padding-left:28px;padding-right:28px; padding-bottom:3px;padding-top:3px; -webkit-text-size-adjust:none;white-space: nowrap; word-break:break-all; direction:ltr; min-width:194px;"
                                                      target="_blank"
                                                      >立即查看</a
                                                    >
                                                  </div>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>
                                          <table
                                            class="sign-off"
                                            style="border:0 none; border-collapse:collapse; mso-table-lspace:0; mso-table-rspace:0"
                                            border="0"
                                            cellpadding="0"
                                            cellspacing="0"
                                            width="100%"
                                          >
                                            <tbody>
                                              <tr>
                                                <td
                                                  dir="ltr"
                                                  class="bullet-copy"
                                                  style="border-collapse:collapse; color:#5f6368; font-family:Roboto, Arial, Helvetica, sans-serif; text-align:left; font-size:16px; line-height:26px; direction:ltr; padding:20px 30px 0 30px;word-break:break-all;"
                                                  valign="top"
                                                  width="93%"
                                                >
                                                  此致
                                                </td>
                                              </tr>
                                              <tr>
                                                <td
                                                  dir="ltr"
                                                  style="border-collapse:collapse; color:#5f6368; font-family:Roboto, Arial, Helvetica, sans-serif; font-size:16px; direction:ltr; text-align:left; line-height:26px; word-break:break-all;padding:0px 30px 25px 30px;word-break:break-all;"
                                                  width="93%"
                                                  direction="ltr"
                                                >
                                                  <strong>${systemTitle} 敬上</strong>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td
                  class="footer-content"
                  style="border-collapse:collapse; font-family:Roboto, sans-serif; padding:25px 30px; border: 2px solid #f1f3f4;"
                  align="center"
                  bgcolor="#ffffff"
                  valign="top"
                  width="100%"
                >
                  <table
                    style="border:0 none; border-collapse:collapse; mso-table-lspace:0; mso-table-rspace:0"
                    align="center"
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    width="100%"
                  >
                    <tbody>
                      <tr>
                        <td
                          class="footer-addr"
                          colspan="2"
                          style="border-collapse:collapse; color:#999999;direction:ltr; font-size:10px;line-height:14px; padding:0 0 15px"
                          align="center"
                          valign="top"
                          width="100%"
                        >
                          <span
                            class="ios-link-footer-addr"
                            style="color:#999999; cursor:text; text-decoration:none"
                            ><font
                              ><span
                                style="color:#999999; cursor:text; text-decoration:none; font-family:Roboto, sans-serif;"
                              >
                                <span
                                  style="font-size:inherit; color:inherit; font-weight:inherit; line-height:inherit; font-family:inherit;"
                                  >© ${dateFormat()}</span
                                >
                              </span></font
                            ></span
                          >
                        </td>
                      </tr>
                      <tr>
                        <td
                          colspan="2"
                          class="footer-legal last"
                          style="border-collapse:collapse; color:#999999; font-family:Roboto, sans-serif; font-size:10px;direction:ltr; line-height:14px; padding:0 0 15px; padding-bottom:0;word-break:break-all;"
                          align="center"
                          valign="top"
                          width="100%"
                        >
                          <span style="font-size:inherit; color:inherit;font-weight:inherit;"
                            >我们向您发送这封必读的电子邮件服务通告，目的是让您了解 ${systemUrl}
                            的重要变化。</span
                          >
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  </tbody>
</table>
  `;
};
