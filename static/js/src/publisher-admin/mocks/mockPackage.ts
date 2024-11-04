const mockPackage = {
  authority: null,
  contact: "mailto:john.doe@canonical.com",
  "default-track": "latest",
  description:
    "This will install and setup WordPress optimized to run in the cloud. By default it will \nplace Ngnix and php-fpm configured to scale horizontally with Nginx's reverse proxy.\n",
  id: "SOjruIxw5EvYsdcT84XpQNc11X2k",
  links: {
    contact: ["mailto:john.doe@canonical.com"],
    website: [],
  },
  media: [
    {
      type: "icon",
      url: "https://api.charmhub.io/api/v1/media/download/charm_VSOjrugIxw5EvYsdcT84XpQwNc11Xj2k_icon_9213239a9c8cd00aeb48022ed9826b27c62763960488a45189dd22ecea7d691e.png",
    },
  ],
  name: "test-charm-name",
  private: false,
  publisher: {
    "display-name": "John Doe",
    id: "prFvmvasQbXLNaVaQV4EAJ8zh0Ej",
    username: "johndoe",
    validation: "unproven",
  },
  status: "published",
  store: "ubuntu",
  summary:
    "WordPress is a full featured web blogging tool, this charm deploys it.",
  title: "Test charm name",
  "track-guardrails": [],
  tracks: [
    {
      "automatic-phasing-percentage": null,
      "created-at": "2024-04-24T14:56:31.444168",
      name: "latest",
      "version-pattern": null,
    },
  ],
  type: "charm",
  website: null,
};

export default mockPackage;
