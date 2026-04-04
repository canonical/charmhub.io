# syntax=docker/dockerfile:experimental

# Build stage: Install python dependencies
# ===
FROM ubuntu:noble AS python-dependencies
RUN apt-get update && apt-get install --no-install-recommends --yes python3-pip python3-setuptools python3-venv build-essential git ca-certificates
ADD requirements.txt /tmp/requirements.txt
RUN pip3 config set global.disable-pip-version-check true
RUN python3 -m venv /venv
ENV PATH="/venv/bin:${PATH}"
RUN --mount=type=cache,target=/root/.cache/pip pip3 install --requirement /tmp/requirements.txt

# Build stage: Install yarn dependencies
# ===
FROM node:25 AS yarn-dependencies
WORKDIR /srv
ADD package.json .
ADD yarn.lock .
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn yarn install --production

# Build stage: Run "yarn run build"
# ===
FROM yarn-dependencies AS build
ADD static static
ADD vite.config.js .
ADD tsconfig.json .
ADD templates templates
ADD vitePluginDetectInput.js .
RUN yarn install
RUN yarn run build

# Set up environment
ENV LANG C.UTF-8
WORKDIR /srv

# Build the production image
# ===
FROM ubuntu:noble

# Install python and import python dependencies
RUN apt-get update && apt-get install --no-install-recommends --yes python3-setuptools python3-lib2to3 python3-pkg-resources ca-certificates gpg
COPY --from=python-dependencies /venv /venv
ENV PATH="/venv/bin:${PATH}"

# Import code, build assets
ADD . .
RUN rm -rf package.json yarn.lock babel.config.json requirements.txt
COPY --from=build /srv/static/js static/js


# Setup commands to run server
ENTRYPOINT ["./entrypoint"]
CMD ["0.0.0.0:80"]
