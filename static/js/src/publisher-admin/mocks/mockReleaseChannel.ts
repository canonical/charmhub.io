export const mockReleaseChannel: ReleaseChannel = {
  track: "latest",
  risk: "stable",
  releases: [
    {
      revision: {
        version: "1.0",
        bases: [
          { name: "ubuntu", channel: "18.04", architecture: "amd64" },
          { name: "centos", channel: "7", architecture: "amd64" },
        ],
        "created-at": "2022-01-01",
        "sha3-384": "123456",
        errors: null,
        revision: 1,
        size: 12345,
        status: "published",
      },
      resources: [
        { name: "resource1", type: "oci", revision: 2 },
        { name: "resource2", type: "file", revision: null },
      ],
    },
    {
      revision: {
        version: "2.0",
        bases: [
          { name: "ubuntu", channel: "20.04", architecture: "amd64" },
          { name: "centos", channel: "8", architecture: "amd64" },
        ],
        "created-at": "2022-01-01",
        "sha3-384": "123456",
        errors: null,
        revision: 1,
        size: 12345,
        status: "published",
      },
      resources: [],
    },
  ],
};
