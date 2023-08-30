function knuthShuffle(originalArray: unknown[]) {
  const array = [...originalArray];
  let currentIndex = array.length;
  let randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

function durstenfeldShuffle(originalArray: unknown[]) {
  const array = [...originalArray];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function shuffleDeck(deck: string[]): string[] {
  const randomNumber = randomIntFromInterval(1, 3);

  if (randomNumber === 1) {
    return knuthShuffle([...deck]) as string[];
  }

  if (randomNumber === 2) {
    return durstenfeldShuffle([...deck]) as string[];
  }

  return knuthShuffle(durstenfeldShuffle([...deck])) as string[];
}
