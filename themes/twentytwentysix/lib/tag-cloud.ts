/** 3D tag sphere — ported from client TagCloud/tag.ts */
interface TagNode {
  cx: number;
  cy: number;
  cz: number;
  x: number;
  y: number;
  scale: number;
  alpha: number;
  zIndex: number;
  on: boolean;
  offsetWidth: number;
  offsetHeight: number;
}

export class TagCloudEngine {
  private oDiv: HTMLDivElement | null = null;
  private aA: HTMLCollectionOf<HTMLAnchorElement> | null = null;
  private mcList: TagNode[] = [];
  private sa = 0;
  private ca = 1;
  private sb = 0;
  private cb = 1;
  private sc = 0;
  private cc = 1;
  private radius = 90;
  private d = 200;
  private dtr = Math.PI / 180;
  private distr = true;
  private tSpeed = 11;
  private size = 200;
  private mouseX = 0;
  private mouseY = 10;
  private howElliptical = 1;
  private rafId = 0;

  init(container: HTMLDivElement) {
    this.destroy();
    this.oDiv = container;
    this.aA = container.getElementsByTagName('a');
    this.mcList = [];

    for (let i = 0; i < this.aA.length; i += 1) {
      const el = this.aA[i];
      const oTag: TagNode = {
        cx: 0,
        cy: 0,
        cz: 0,
        x: 0,
        y: 0,
        scale: 1,
        alpha: 1,
        zIndex: 0,
        on: false,
        offsetWidth: el.offsetWidth,
        offsetHeight: el.offsetHeight,
      };

      el.onmouseover = () => {
        oTag.on = true;
        el.style.zIndex = '9999';
        el.style.color = '#fff';
        el.style.padding = '5px 10px';
        el.style.opacity = '1';
      };
      el.onmouseout = () => {
        oTag.on = false;
        el.style.zIndex = String(oTag.zIndex);
        el.style.color = '#fff';
        el.style.padding = '5px 8px';
        el.style.opacity = String(oTag.alpha);
      };

      this.mcList.push(oTag);
    }

    this.sineCosine(0, 0, 0);
    this.positionAll();
    this.rafId = requestAnimationFrame(this.update);
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    this.oDiv = null;
    this.aA = null;
    this.mcList = [];
  }

  private update = () => {
    const a =
      (Math.min(Math.max(-this.mouseY, -this.size), this.size) / this.radius) * this.tSpeed;
    const b =
      (-Math.min(Math.max(-this.mouseX, -this.size), this.size) / this.radius) * this.tSpeed;

    if (Math.abs(a) > 0.01 || Math.abs(b) > 0.01) {
      this.sineCosine(a, b, 0);
      for (let i = 0; i < this.mcList.length; i += 1) {
        if (this.mcList[i].on) continue;
        const rx1 = this.mcList[i].cx;
        let ry1 = this.mcList[i].cy * this.ca + this.mcList[i].cz * -this.sa;
        let rz1 = this.mcList[i].cy * this.sa + this.mcList[i].cz * this.ca;

        const rx2 = rx1 * this.cb + rz1 * this.sb;
        ry1 = ry1;
        const rz2 = rx1 * -this.sb + rz1 * this.cb;

        const rx3 = rx2 * this.cc + ry1 * -this.sc;
        const ry3 = rx2 * this.sc + ry1 * this.cc;
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

  private positionAll() {
    if (!this.oDiv || !this.aA) return;
    const max = this.mcList.length;
    for (let i = 0; i < max; i += 1) {
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

      this.aA[i].style.left = `${this.mcList[i].cx + this.oDiv.offsetWidth / 2 - this.mcList[i].offsetWidth / 2}px`;
      this.aA[i].style.top = `${this.mcList[i].cy + this.oDiv.offsetHeight / 2 - this.mcList[i].offsetHeight / 2}px`;
    }
  }

  private doPosition() {
    if (!this.oDiv || !this.aA) return;
    const l = this.oDiv.offsetWidth / 2;
    const t = this.oDiv.offsetHeight / 2;
    for (let i = 0; i < this.mcList.length; i += 1) {
      if (this.mcList[i].on) continue;
      const aAs = this.aA[i].style;
      if (this.mcList[i].alpha > 0.1) {
        if (aAs.display !== '') aAs.display = '';
      } else {
        if (aAs.display !== 'none') aAs.display = 'none';
        continue;
      }
      aAs.left = `${this.mcList[i].cx + l - this.mcList[i].offsetWidth / 2}px`;
      aAs.top = `${this.mcList[i].cy + t - this.mcList[i].offsetHeight / 2}px`;
      aAs.opacity = String(this.mcList[i].alpha);
      aAs.zIndex = String(this.mcList[i].zIndex);
    }
  }

  private sineCosine(a: number, b: number, c: number) {
    this.sa = Math.sin(a * this.dtr);
    this.ca = Math.cos(a * this.dtr);
    this.sb = Math.sin(b * this.dtr);
    this.cb = Math.cos(b * this.dtr);
    this.sc = Math.sin(c * this.dtr);
    this.cc = Math.cos(c * this.dtr);
  }
}
