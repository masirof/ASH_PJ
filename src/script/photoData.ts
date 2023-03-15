import { shuffleArray } from './util';

interface PhotoDataRawItem {
  image: string[];
  like_count: number;
  created_at: string;
  tweet_url: string;
}
interface PhotoDataItem extends PhotoDataRawItem {
  id: number;
}
type PhotoDataRaw = { [key: string]: PhotoDataRawItem };

/** Fetches remote photo data JSON and decode to array */
const fetchPhotoData = async function (url: string | URL) {
  // fetch remote JSON
  const res = await fetch(url);
  if (!res.ok) {
    throw Error(`Failed to fetch JSON file, server responded ${res.status}`);
  }
  const text = await res.text();
  const rawData = JSON.parse(text) as PhotoDataRaw;

  // convert raw data ({ "1": {...}, "2": {...} }) into array
  const photoData: PhotoDataItem[] = [];
  for (const id in rawData) {
    photoData.push({
      id: parseInt(id),
      ...rawData[id],
    });
  }
  photoData.sort((a, b) => a.id - b.id);

  return photoData;
};

/** Extracts kind of service, user name and build user link from a url */
const extractUserFromURL = function (url: string | URL) {
  const boothRegExp = /([a-zA-Z0-9_.! '\(\)-]+)\.booth\.com/;
  if (typeof url === 'string') {
    url = new URL(url);
  }

  const hostname = url.hostname;
  const path = url.pathname.split('/');

  if (hostname === 'twitter.com') {
    return {
      service: 'twitter',
      userName: path[1],
      userLink: `https://twitter.com/${path[1]}/`,
    };
  } else if (hostname === 'ash-cale.com') {
    return {
      service: 'ash-cale',
      userName: 'ash-cale',
      userLink: `https://ash-cale.com`,
    };
  } else if (boothRegExp.test(hostname)) {
    const userName = hostname.match(boothRegExp)?.[1];
    if (!userName) {
      return null;
    }
    return {
      service: 'booth',
      userName,
      userLink: `https://${userName}.booth.com/`,
    };
  }

  return null;
};

export { fetchPhotoData, extractUserFromURL };
export type { PhotoDataItem };
