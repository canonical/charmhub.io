export interface ICharm {
  name: string;
  store_front: {
    icons: string[];
    "display-name": string;
  };
  result: {
    publisher: {
      "display-name": string;
    };
  };
}
