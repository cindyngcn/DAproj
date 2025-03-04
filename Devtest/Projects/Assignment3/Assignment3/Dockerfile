# Use the specified Node.js Alpine image
FROM node:22.14.0-alpine3.21

# Set the working directory inside the container
WORKDIR /app

# Copy the assignment3-1.0.0.tgz file into the container
COPY assignment3-1.0.0.tgz .

# Install the .tgz package
RUN npm install assignment3-1.0.0.tgz

# Copy the application source code to the container
COPY . .

# Clean npm cache
RUN npm cache clean --force

# Debug step: Compare the package.json files
RUN cmp package.json node_modules/assignment3/package.json || exit 1

# Rename node_modules to new_node_modules
RUN mv ./node_modules ./new_node_modules

# Move to the source code directory
RUN mv ./new_node_modules/assignment3/node_modules ./

# Create non-system user (without password, -D)
RUN adduser -D user

# Change ownership of the /app directory to the user
RUN chmod 555 -R /app

# Only owner can rwx the home folder
RUN chmod 700 -R /home

USER user

# Expose the port your application runs on (if applicable, for documentation only)
EXPOSE 8000

# Define the command to run your application
CMD [ "node", "index.js" ]
