export interface ICharm {
  package: {
    description: string;
    display_name: string;
    icon_url?: string;
    name: string;
    platforms: Array<string>;
    channel: {
      name: string;
      risk: string;
      track: string;
    };
  };
  publisher: {
    display_name: string;
    name: string;
    validation?: string;
  };
};
