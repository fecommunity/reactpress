interface TagParams {
  radius?: number;
  d?: number;
  dtr?: number;
  distr?: boolean;
  tSpeed?: number;
  size?: number;
}

interface TagMeta {
  on?: boolean;
  offsetWidth: number;
  offsetHeight: number;
  cx: number;
  cy: number;
  cz: number;
  x: number;
  y: number;
  scale: number;
  alpha: number;
  zIndex: number;
}

export default class TagCloudEngine {
  private oDiv?: HTMLDivElement;
  private aA: HTMLCollectionOf<HTMLAnchorElement> | null = null;
  private sa = 0;
  private ca = 0;
  private sb = 0;
  private cb = 0;
  private sc = 0;
  private cc = 0;

  protected radius = 90;
  protected d = 200;
  protected dtr = Math.PI / 180;
  protected mcList: TagMeta[] = [];
  protected distr = true;
  protected tSpeed = 11;
  protected size = 200;
  protected readonly mouseX = 0;
  protected readonly mouseY = 10;
  protected readonly howElliptical = 1;
  private rafId: number | null = null;

  constructor(params?: TagParams) {
    if (params?.radius != null) this.radius = params.radius;
    if (params?.d != null) this.d = params.d;
    if (params?.dtr != null) this.dtr = params.dtr;
    if (params?.distr != null) this.distr = params.distr;
    if (params?.tSpeed != null) this.tSpeed = params.tSpeed;
    if (params?.size != null) this.size = params.size;
  }

  destroy = () => {
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.mcList = [];
    this.aA = null;
  };

  init = (container?: HTMLDivElement | string) => {
    this.destroy();

    if (container instanceof HTMLDivElement) {
      this.oDiv = container;
    } else if (typeof container === 'string') {
      this.oDiv = document.querySelector(container) as HTMLDivElement | null;
    }

    if (!this.oDiv) return;

    this.aA = this.oDiv.getElementsByTagName('a');
    if (!this.aA.length) return;

    for (let i = 0; i < this.aA.length; i++) {
      const el = this.aA[i];
      const meta: TagMeta = {
        offsetWidth: el.offsetWidth,
        offsetHeight: el.offsetHeight,
        cx: 0,
        cy: 0,
        cz: 0,
        x: 0,
        y: 0,
        scale: 1,
        alpha: 1,
        zIndex: 0,
      };

      el.onmouseover = function (this: HTMLAnchorElement) {
        meta.on = true;
        this.style.zIndex = '9999';
        this.style.color = '#fff';
        this.style.padding = '5px 10px';
        this.style.opacity = '1';
      };

      el.onmouseout = function (this: HTMLAnchorElement) {
        meta.on = false;
        this.style.zIndex = String(meta.zIndex);
        this.style.color = '#fff';
        this.style.padding = '5px 8px';
        this.style.opacity = String(meta.alpha);
      };

      this.mcList.push(meta);
    }

    this.sineCosine(0, 0, 0);
    this.positionAll();
    this.doPosition();
    this.rafId = requestAnimationFrame(this.update);
  };

  private update = () => {
    const a =
      (Math.min(Math.max(-this.mouseY, -this.size), this.size) / this.radius) * this.tSpeed;
    const b =
      (-Math.min(Math.max(-this.mouseX, -this.size), this.size) / this.radius) * this.tSpeed;

    if (Math.abs(a) > 0.01 || Math.abs(b) > 0.01) {
      this.sineCosine(a, b, 0);

      for (let i = 0; i < this.mcList.length; i++) {
        if (this.mcList[i].on) continue;

        const rx1 = this.mcList[i].cx;
        const ry1 = this.mcList[i].cy * this.ca + this.mcList[i].cz * -this.sa;
        const rz1 = this.mcList[i].cy * this.sa + this.mcList[i].cz * this.ca;

        const rx2 = rx1 * this.cb + rz1 * this.sb;
        const ry2 = ry1;
        const rz2 = rx1 * -this.sb + rz1 * this.cb;

        const rx3 = rx2 * this.cc + ry2 * -this.sc;
        const ry3 = rx2 * this.sc + ry2 * this.cc;
        const rz3 = rz2;

        this.mcList[i].cx = rx3;
        this.mcList[i].cy = ry3;
        this.mcList[i].cz = rz3;

        const per = this.d / (this.d + rz3);
        this.mcList[i].x = this.howElliptical * rx3 * per - this.howElliptical * 2;
        this.mcList[i].y = ry3 * per;
        this.mcList[i].scale = per;

        let alpha = per;
        alpha = (alpha - 0.6) * (10 / 6);
        this.mcList[i].alpha = alpha * alpha * alpha - 0.2;
        this.mcList[i].zIndex = Math.ceil(100 - Math.floor(this.mcList[i].cz));
      }

      this.doPosition();
    }

    this.rafId = requestAnimationFrame(this.update);
  };

  private positionAll = () => {
    const max = Math.min(this.mcList.length, this.aA?.length ?? 0);
    if (!max || !this.oDiv) return;

    for (let i = 0; i < max; i++) {
      const el = this.aA?.[i];
      if (!el) continue;

      let phi = 0;
      let theta = 0;
      if (this.distr) {
        phi = Math.acos(-1 + (2 * (i + 1) - 1) / max);
        theta = Math.sqrt(max * Math.PI) * phi;
      } else {
        phi = Math.random() * Math.PI;
        theta = Math.random() * (2 * Math.PI);
      }

      this.mcList[i].cx = this.radius * Math.cos(theta) * Math.sin(phi);
      this.mcList[i].cy = this.radius * Math.sin(theta) * Math.sin(phi);
      this.mcList[i].cz = this.radius * Math.cos(phi);

      el.style.left = `${this.mcList[i].cx + this.oDiv.offsetWidth / 2 - this.mcList[i].offsetWidth / 2}px`;
      el.style.top = `${this.mcList[i].cy + this.oDiv.offsetHeight / 2 - this.mcList[i].offsetHeight / 2}px`;
    }
  };

  private doPosition = () => {
    if (!this.oDiv) return;

    const l = this.oDiv.offsetWidth / 2;
    const t = this.oDiv.offsetHeight / 2;
    const count = Math.min(this.mcList.length, this.aA?.length ?? 0);

    for (let i = 0; i < count; i++) {
      if (this.mcList[i].on) continue;

      const el = this.aA?.[i];
      if (!el) continue;

      if (this.mcList[i].alpha > 0.1) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
        continue;
      }

      el.style.left = `${this.mcList[i].cx + l - this.mcList[i].offsetWidth / 2}px`;
      el.style.top = `${this.mcList[i].cy + t - this.mcList[i].offsetHeight / 2}px`;
      el.style.opacity = String(this.mcList[i].alpha);
      el.style.zIndex = String(this.mcList[i].zIndex);
    }
  };

  private sineCosine = (a: number, b: number, c: number) => {
    this.sa = Math.sin(a * this.dtr);
    this.ca = Math.cos(a * this.dtr);
    this.sb = Math.sin(b * this.dtr);
    this.cb = Math.cos(b * this.dtr);
    this.sc = Math.sin(c * this.dtr);
    this.cc = Math.cos(c * this.dtr);
  };
}
