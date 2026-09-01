export interface ICharm {
  package: {
    description: string;
    display_name: string;
    last_updated?: string;
    icon_url?: string;
    name: string;
    platforms: Array<string>;
    summary?: string;
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
  categories?: Array<{
    display_name: string;
    name: string;
  }>;
}
