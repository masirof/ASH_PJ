import './common';
import { getElementByIdOrThrow, shuffleArray, DataLoader } from './util';
import { fetchPhotoData, extractUserFromURL, PhotoDataItem } from './photoData';

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
  authorURL: string,
  linkTarget: string,
  callback: (error: any) => void
) {
  const elArticle = document.createElement('article');

  const elLink = document.createElement('a');
  const elImage = document.createElement('img');
  elLink.href = linkTarget;
  elLink.appendChild(elImage);
  elArticle.appendChild(elLink);

  const elAuthorDiv = document.createElement('div');
  if (typeof author === 'string') {
    elAuthorDiv.innerHTML =
      `<span>by<span> ` +
      `<span><a href="${authorURL}" target="_blank" rel="noopener">${author}</a></span>`;
  } else {
    elAuthorDiv.innerHTML = `<span><a href="${authorURL}" target="_blank" rel="noopener">Author</a></span>`;
  }
  elAuthorDiv.className = 'author';
  elArticle.appendChild(elAuthorDiv);

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

// load specified number of photos and append to document
const loadPhotos = async function (
  photoDataLoader: DataLoader<PhotoDataItem>,
  outputElement: HTMLElement,
  num: number
) {
  if (photoDataLoader.done()) {
    return true;
  }

  const imageLoadPromise = [];
  let allPhotosLoaded = false;

  for (let i = 0; i < num; i++) {
    const { value, done } = photoDataLoader.next();

    const userInfo = extractUserFromURL(value.tweet_url);
    for (const imageUrl of value.image) {
      imageLoadPromise.push(
        new Promise((resolve) => {
          const elArticle = createArticle(
            imageUrl,
            userInfo?.userName ?? null,
            userInfo?.userLink ?? value.tweet_url,
            imageUrl,
            (error) => {
              if (error) {
                outputElement.removeChild(elArticle);
              }
              resolve(undefined);
            }
          );
          outputElement.appendChild(elArticle);
        })
      );
    }

    if (done) {
      allPhotosLoaded = true;
      break;
    }
  }

  await Promise.all(imageLoadPromise);

  return allPhotosLoaded;
};

window.addEventListener('load', async () => {
  const elPhoto = getElementByIdOrThrow('photo');
  const elLoadInfo = getElementByIdOrThrow('load_info');

  const photoData = await fetchPhotoData('data/tweets.json').catch((error) => {
    // failed to fetch photo data
    console.error(error);
    elLoadInfo.style.display = 'block';

    return [] as PhotoDataItem[];
  });
  const photoDataLoader = new DataLoader(photoData);

  const initialPhotoCount = 30;
  const additionalPhotoCount = 10;
  await loadPhotos(photoDataLoader, elPhoto, initialPhotoCount);

  //// Load photos when scrolling to the bottom of the page ////
  const pageHeightMultiplier = 2;
  let photoLoadDisabled = false;

  window.addEventListener('scroll', () => {
    if (photoLoadDisabled) {
      return;
    }

    const scrollThreshold =
      document.body.scrollHeight - window.innerHeight * pageHeightMultiplier;

    if (window.scrollY > scrollThreshold) {
      photoLoadDisabled = true;
      loadPhotos(photoDataLoader, elPhoto, additionalPhotoCount).then(() => {});

      loadPhotos(photoDataLoader, elPhoto, additionalPhotoCount).then(
        (allPhotosLoaded) => {
          photoLoadDisabled = allPhotosLoaded;
        }
      );
    }
  });

  //// register buttons ////
  const changeWidthButton = getElementByIdOrThrow('change_width');
  changeWidthButton.addEventListener('click', () => {
    elPhoto.classList.toggle('width-expanded');
  });

  const shuffleButton = getElementByIdOrThrow('shuffle');
  shuffleButton.addEventListener('click', async () => {
    photoLoadDisabled = true;

    elPhoto.innerHTML = '';
    photoDataLoader.reset();
    photoDataLoader.shuffle();
    await loadPhotos(photoDataLoader, elPhoto, initialPhotoCount);

    photoLoadDisabled = false;
  });

  const returnTopButton = getElementByIdOrThrow('return_top');
  returnTopButton.addEventListener('click', () => {
    window.scroll(0, 0);
  });
});
