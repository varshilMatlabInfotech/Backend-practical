import { Friendship } from 'models';

export async function getFriendshipList(body) {
  const friendship = await Friendship.findById(body);
  return friendship;
}

export async function createFriendship(body) {
  // check requested userid is is exist or not    if - no create
  const friendship = await Friendship.create(body);
  return friendship;
}

export async function getFriendshipListWithPagination(id, body) {}

export async function getFriendshipByids(body) {
  const friendship = await Friendship.findOne(body);
  return friendship;
}
export async function putFriendshipResponse(id, body) {
  const friendship = await Friendship.findOneAndUpdate(id, body);
  return friendship;
}
