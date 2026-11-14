// ORBITLAB — Physical Collision Detection
// Detects surface contact: distance <= radius1 + radius2

import type { CelestialBody, CollisionState } from './physics-types';
import { vec3 } from './vector3';

export function checkCollision(
  body1: CelestialBody,
  body2: CelestialBody,
  currentTime: number,
  existingCollisionState?: CollisionState
): CollisionState {
  const d = vec3.sub(body2.position, body1.position);
  const distance = vec3.length(d);
  const contactDistance = body1.radius + body2.radius;

  const isColliding = distance <= contactDistance;

  if (isColliding) {
    const vRel = vec3.length(vec3.sub(body2.velocity, body1.velocity));
    return {
      isColliding: true,
      collisionTime: existingCollisionState?.collisionTime ?? currentTime,
      distance,
      contactDistance,
      relativeVelocity: vRel,
    };
  }

  return {
    isColliding: false,
    collisionTime: null,
    distance,
    contactDistance,
    relativeVelocity: vec3.length(vec3.sub(body2.velocity, body1.velocity)),
  };
}
