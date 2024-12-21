interface TagParams {
  radius: number;
  d: number;
  dtr: number;
  distr: boolean;
  tSpeed: number;
  size: number;
}
class Tag {
  // 私有成员，用于存储HTML中的div元素
  private oDiv: HTMLDivElement;
  // 私有成员，用于存储所有<a>标签的HTMLCollection
  private aA = null;
  // 私有成员，用于存储计算过程中的sin和cos值
  private sa;
  private ca;
  private sb;
  private cb;
  private sc;
  private cc;

  // 保护成员，定义了一些常量，用于后续的动画和位置计算
  protected radius = 90; // 半径
  protected d = 200; // 距离常量
  protected dtr = Math.PI / 180; // 角度转弧度
  protected mcList = []; // 用于存储所有标签的元数据
  protected distr = true; // 分布模式，true为均匀分布，false为随机分布
  protected tSpeed = 11; // 动画速度
  protected size = 200; // 视图大小
  // 鼠标位置的初始值
  protected readonly mouseX = 0;
  protected readonly mouseY = 10;
  protected readonly howElliptical = 1; // 椭圆度

  constructor(params?: TagParams) {
    const { radius, d, dtr, distr, tSpeed, size } = params || {};
    this.radius = radius || this.radius;
    this.d = d || this.d;
    this.dtr = dtr || this.dtr;
    this.distr = distr || this.distr;
    this.tSpeed = tSpeed || this.tSpeed;
    this.size = size || this.size;
  }

  private initContainer(container: HTMLDivElement | string) {
    if (this.oDiv) {
      this.oDiv = this.oDiv;
    } else if (container instanceof HTMLDivElement) {
      this.oDiv = container;
    } else {
      this.oDiv = document.querySelector(container);
    }
  }

  /**
   * 初始化方法，为所有<a>标签添加事件监听器，并初始化位置
   */
  public init = (container?: HTMLDivElement | string) => {
    let i = 0;
    let oTag = null;
    // 初始化
    this.initContainer(container);
    // 获取左右的标签
    this.aA = this.oDiv.getElementsByTagName('a');
    for (i = 0; i < this.aA.length; i++) {
      oTag = {};
      this.aA[i].onmouseover = (function (obj) {
        return function () {
          obj.on = true;
          this.style.zIndex = 9999;
          this.style.color = '#fff';
          this.style.padding = '5px 10px';
          this.style.filter = 'alpha(opacity=100)';
          this.style.opacity = 1;
        };
      })(oTag);
      this.aA[i].onmouseout = (function (obj) {
        return function () {
          obj.on = false;
          this.style.zIndex = obj.zIndex;
          this.style.color = '#fff';
          this.style.padding = '5px 8px';
          this.style.filter = 'alpha(opacity=' + 100 * obj.alpha + ')';
          this.style.opacity = obj.alpha;
          this.style.zIndex = obj.zIndex;
        };
      })(oTag);
      oTag.offsetWidth = this.aA[i].offsetWidth;
      oTag.offsetHeight = this.aA[i].offsetHeight;
      this.mcList.push(oTag);
    }
    this.sineCosine(0, 0, 0);
    this.positionAll();
    requestAnimationFrame(this.update);
  };

  /**
   * 动画更新方法
   */
  private update = () => {
    let a,
      b,
      c = 0;
    a = (Math.min(Math.max(-this.mouseY, -this.size), this.size) / this.radius) * this.tSpeed;
    b = (-Math.min(Math.max(-this.mouseX, -this.size), this.size) / this.radius) * this.tSpeed;
    if (Math.abs(a) <= 0.01 && Math.abs(b) <= 0.01) {
      return;
    }
    this.sineCosine(a, b, c);
    for (let i = 0; i < this.mcList.length; i++) {
      if (this.mcList[i].on) {
        continue;
      }
      let rx1 = this.mcList[i].cx;
      let ry1 = this.mcList[i].cy * this.ca + this.mcList[i].cz * -this.sa;
      let rz1 = this.mcList[i].cy * this.sa + this.mcList[i].cz * this.ca;

      let rx2 = rx1 * this.cb + rz1 * this.sb;
      let ry2 = ry1;
      let rz2 = rx1 * -this.sb + rz1 * this.cb;

      let rx3 = rx2 * this.cc + ry2 * -this.sc;
      let ry3 = rx2 * this.sc + ry2 * this.cc;
      let rz3 = rz2;

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

    requestAnimationFrame(this.update);
  };

  /**
   * 根据分布模式初始化所有标签的位置
   */
  private positionAll = () => {
    let phi = 0;
    let theta = 0;
    let max = this.mcList.length;
    for (let i = 0; i < max; i++) {
      if (this.distr) {
        phi = Math.acos(-1 + (2 * (i + 1) - 1) / max);
        theta = Math.sqrt(max * Math.PI) * phi;
      } else {
        phi = Math.random() * Math.PI;
        theta = Math.random() * (2 * Math.PI);
      }
      //坐标变换
      this.mcList[i].cx = this.radius * Math.cos(theta) * Math.sin(phi);
      this.mcList[i].cy = this.radius * Math.sin(theta) * Math.sin(phi);
      this.mcList[i].cz = this.radius * Math.cos(phi);

      this.aA[i].style.left = this.mcList[i].cx + this.oDiv.offsetWidth / 2 - this.mcList[i].offsetWidth / 2 + 'px';
      this.aA[i].style.top = this.mcList[i].cy + this.oDiv.offsetHeight / 2 - this.mcList[i].offsetHeight / 2 + 'px';
    }
  };

  /**
   * 根据最新的位置数据更新标签的实际显示位置
   */
  private doPosition = () => {
    let l = this.oDiv.offsetWidth / 2;
    let t = this.oDiv.offsetHeight / 2;
    for (let i = 0; i < this.mcList.length; i++) {
      if (this.mcList[i].on) {
        continue;
      }
      let aAs = this.aA[i].style;
      if (this.mcList[i].alpha > 0.1) {
        if (aAs.display != '') aAs.display = '';
      } else {
        if (aAs.display != 'none') aAs.display = 'none';
        continue;
      }
      aAs.left = this.mcList[i].cx + l - this.mcList[i].offsetWidth / 2 + 'px';
      aAs.top = this.mcList[i].cy + t - this.mcList[i].offsetHeight / 2 + 'px';
      aAs.filter = 'alpha(opacity=' + 100 * this.mcList[i].alpha + ')';
      aAs.zIndex = this.mcList[i].zIndex;
      aAs.opacity = this.mcList[i].alpha;
    }
  };

  /**
   *  计算sin和cos值的方法
   */
  private sineCosine = (a, b, c) => {
    this.sa = Math.sin(a * this.dtr);
    this.ca = Math.cos(a * this.dtr);
    this.sb = Math.sin(b * this.dtr);
    this.cb = Math.cos(b * this.dtr);
    this.sc = Math.sin(c * this.dtr);
    this.cc = Math.cos(c * this.dtr);
  };
}

export default Tag;
