// TODO: Hacky way of sharing ids between react context and non react context functrions
let userId = "";

export function getUserId() {
  return userId;
}

export function setUserId(id: string) {
  userId = id;
}
