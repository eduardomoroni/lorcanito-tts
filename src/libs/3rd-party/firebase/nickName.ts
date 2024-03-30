import { debounce } from "~/libs/debounce";
import { updateProfile, User } from "firebase/auth";
import { useDatabase } from "reactfire";
import { ref, set } from "firebase/database";
import { generateUserName } from "~/libs/name-generator/generator";

const fallbackNickName = generateUserName();

export const updateNickName = debounce(
  (
    database: ReturnType<typeof useDatabase>,
    user: User,
    displayName: string = fallbackNickName,
  ) => {
    updateProfile(user, {
      displayName,
    });
    set(ref(database, `users/${user.uid}`), displayName);
  },
  1000,
);
