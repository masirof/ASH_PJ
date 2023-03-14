import './common';
import { getElementByIdOrThrow, shuffleArray } from './util';

interface TweetDataItem {
  image: string[];
  like_count: number;
  created_at: string;
  tweet_url: string;
}
type TweetDataRaw = { [key: string]: TweetDataItem };
const tweetData: (TweetDataItem | null)[] = [];

const fetchAndLoadUserData = async function (remoteJsonURL: string) {
  const response = await fetch(remoteJsonURL);
  if (!response.ok) {
    throw Error(
      `Failed to fetch JSON file, server responded ${response.status}`
    );
  }
  const text = await response.text();
  const rawData = JSON.parse(text) as TweetDataRaw;

  tweetData[0] = null;
  let index = 1;
  while (true) {
    if (!(index in rawData)) {
      break;
    }

    tweetData[index] = rawData[index];

    index += 1;
  }

  return tweetData;
};

const fetchImage = async function (url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw Error(`Failed to load image ${response}`);
  }
  return await response.blob();
};

const createArticle = function (
  imageUrl: string,
  author: string | null,
  linkTarget: string,
  callback: (error: any) => void
) {
  const elArticle = document.createElement('article');

  const elLink = document.createElement('a');
  const elImage = document.createElement('img');
  elLink.href = linkTarget;
  elLink.appendChild(elImage);
  elArticle.appendChild(elLink);

  if (typeof author === 'string') {
    const elAuthorDiv = document.createElement('div');
    elAuthorDiv.innerHTML = `<span>by<span> <span><a href="https://twitter.com/${author}">${author}</a></span>`;
    elAuthorDiv.className = 'author';
    elArticle.appendChild(elAuthorDiv);
  }

  fetchImage(imageUrl)
    .then((blob) => {
      elImage.src = URL.createObjectURL(blob);
      return elImage;
    })
    .then((image) => {
      return new Promise((resolve) => {
        image.onload = resolve;
      });
    })
    .then(() => {
      callback(undefined);
    })
    .catch((error) => {
      callback(error);
    });

  return elArticle;
};

window.addEventListener('load', async () => {
  const elPhoto = getElementByIdOrThrow('photo');
  const elLoadInfo = getElementByIdOrThrow('load_info');
  const shuffleButton = getElementByIdOrThrow('shuffle');
  const returnTopButton = getElementByIdOrThrow('return_top');

  const twitterUrlRegExp = /^https?:\/\/twitter.com\/([a-zA-Z0-9_]+)/;
  const skebUrlRegExp = /^https:\/\/skeb.jp\/@([a-zA-Z0-9_]+)/;

  try {
    await fetchAndLoadUserData('data/tweets.json');
  } catch (error) {
    elLoadInfo.style.display = 'block';
    throw error;
  }

  let photoIndex = 0;
  const loadPhotos = async function (num: number) {
    const promises = [];
    const indexEnd = Math.min(photoIndex + num, tweetData.length);

    for (; photoIndex < indexEnd; photoIndex++) {
      const item = tweetData[photoIndex];
      if (!item) {
        continue;
      }

      const author =
        item.tweet_url.match(twitterUrlRegExp)?.[1] ??
        item.tweet_url.match(skebUrlRegExp)?.[1] ??
        null;

      for (const imageUrl of item.image) {
        promises.push(
          new Promise((resolve) => {
            const elArticle = createArticle(
              `${imageUrl}?format=jpg&name=small`,
              author,
              item.tweet_url,
              (error) => {
                if (error) {
                  elPhoto.removeChild(elArticle);
                }
                resolve(undefined);
              }
            );
            elPhoto.appendChild(elArticle);
          })
        );
      }
    }

    await Promise.all(promises);
  };

  await loadPhotos(30);
  let loading = false;

  const pageHeightMultiplier = 2;
  window.addEventListener('scroll', () => {
    const scrollThreshold =
      document.body.scrollHeight - window.innerHeight * pageHeightMultiplier;
    if (!loading && window.scrollY > scrollThreshold) {
      // console.log('Load: ', photoIndex);
      loading = true;
      loadPhotos(10).then(() => {
        if (photoIndex < tweetData.length) {
          loading = false;
        }
      });
    }
  });

  // register shuffle and return top button listener
  shuffleButton.addEventListener('click', async () => {
    loading = true;
    elPhoto.innerHTML = '';
    photoIndex = 0;

    shuffleArray(tweetData);
    await loadPhotos(30);
    loading = false;
  });
  returnTopButton.addEventListener('click', () => {
    window.scroll(0, 0);
  });
});
