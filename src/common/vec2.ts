export interface Vec2Data {
  x: number
  y: number
}

export class Vec2 implements Vec2Data {
  x = 0

  y = 0

  static distance(a: Vec2, b: Vec2) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
  }

  static manhattan(a: Vec2, b: Vec2) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
  }

  constructor(x?: number | Vec2 | Vec2Data, y?: number) {
    if (typeof x === 'undefined') {
      return
    }

    if (x instanceof Vec2 || typeof x !== 'number') {
      this.x = x.x
      this.y = x.y
      return
    }

    if (typeof y === 'undefined') {
      this.x = x
      this.y = x
      return
    }

    this.x = x
    this.y = y
  }

  eq(vec: Vec2) {
    return this.x === vec.x && this.y === vec.y
  }

  add(vec: Vec2 | Vec2Data): Vec2 {
    return new Vec2(this.x + vec.x, this.y + vec.y)
  }

  sub(vec: Vec2 | Vec2Data): Vec2 {
    return new Vec2(this.x - vec.x, this.y - vec.y)
  }

  floor(): Vec2 {
    return new Vec2(Math.floor(this.x), Math.floor(this.y))
  }

  ceil(): Vec2 {
    return new Vec2(Math.ceil(this.x), Math.ceil(this.y))
  }

  sign(): Vec2 {
    return new Vec2(Math.sign(this.x), Math.sign(this.y))
  }

  scale(scale: number): Vec2 {
    return new Vec2(this.x * scale, this.y * scale)
  }

  length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  toString(): string {
    return `(${this.x}, ${this.y})`
  }

  toJSON(): Vec2Data {
    return { x: this.x, y: this.y }
  }
}
