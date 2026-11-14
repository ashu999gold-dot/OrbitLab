// High-performance 3D Vector utilities for OrbitLab

import type { Vector3D } from '../types/physics';

export const vec3 = {
  create(x = 0, y = 0, z = 0): Vector3D {
    return { x, y, z };
  },

  clone(v: Vector3D): Vector3D {
    return { x: v.x, y: v.y, z: v.z };
  },

  add(a: Vector3D, b: Vector3D): Vector3D {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
  },

  sub(a: Vector3D, b: Vector3D): Vector3D {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  },

  scale(v: Vector3D, s: number): Vector3D {
    return { x: v.x * s, y: v.y * s, z: v.z * s };
  },

  addScaled(a: Vector3D, b: Vector3D, s: number): Vector3D {
    return { x: a.x + b.x * s, y: a.y + b.y * s, z: a.z + b.z * s };
  },

  dot(a: Vector3D, b: Vector3D): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  },

  cross(a: Vector3D, b: Vector3D): Vector3D {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x,
    };
  },

  lengthSq(v: Vector3D): number {
    return v.x * v.x + v.y * v.y + v.z * v.z;
  },

  length(v: Vector3D): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  },

  normalize(v: Vector3D): Vector3D {
    const l = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    if (l === 0) return { x: 0, y: 0, z: 0 };
    return { x: v.x / l, y: v.y / l, z: v.z / l };
  },

  distanceSq(a: Vector3D, b: Vector3D): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return dx * dx + dy * dy + dz * dz;
  },

  distance(a: Vector3D, b: Vector3D): number {
    return Math.sqrt(vec3.distanceSq(a, b));
  },

  lerp(a: Vector3D, b: Vector3D, t: number): Vector3D {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      z: a.z + (b.z - a.z) * t,
    };
  },
};
