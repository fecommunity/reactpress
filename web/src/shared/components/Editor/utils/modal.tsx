import { Modal } from "antd";

import i18n from "@/i18n";

export const confirmRestoreCache = () =>
  new Promise<void>((resolve, reject) => {
    Modal.confirm({
      title: i18n.t("editor.restoreTitle"),
      content: i18n.t("editor.restoreContent"),
      okText: i18n.t("common.ok"),
      cancelText: i18n.t("common.cancel"),
      onOk: () => resolve(),
      onCancel: () => reject(new Error("cancelled")),
    });
  });
