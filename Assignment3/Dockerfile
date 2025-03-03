# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

# ARG NODE_VERSION=22.14.0-alpine3.21

# FROM node:${NODE_VERSION}

# # Use production node environment by default.
# ENV NODE_ENV production


# WORKDIR /usr/src/app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
# RUN --mount=type=bind,source=package.json,target=package.json \
#     --mount=type=bind,source=package-lock.json,target=package-lock.json \
#     --mount=type=cache,target=/root/.npm \
#     npm ci --omit=dev

# Run the application as a non-root user.
# USER node

# Copy the rest of the source files into the image.
# COPY . .

# Expose the port that the application listens on.
# EXPOSE 8000

# Run the application.
# CMD ["node", "index.js"]

# syntax=docker/dockerfile:1

# Use the specified Node.js Alpine image
FROM node:22.14.0-alpine3.21

# Set the working directory inside the container
WORKDIR /app

# Copy the application source code
COPY . .

# Install dependencies
RUN npm install

# Create non-system user (without password, -D)
RUN adduser -D user

# Change ownership of the /app directory to the user
#RUN chown -R user /app
# only give r-x access for all
RUN chmod 555 -R /app

# only owner can rwx the home folder
RUN chmod 700 -R /home

USER user

# Expose the port your application runs on (if applicable, for documentation only)
EXPOSE 8000

# Define the command to run your application
CMD [ "node", "index.js" ]
