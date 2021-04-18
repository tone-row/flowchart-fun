# Specify a base image
FROM node:14.5.0 

# Create working directory and copy the app before running yarn install as the artifactory
# credentials can be inside .npmrc
WORKDIR /usr/src/app
COPY . ./

# Run yarn install
RUN yarn install
EXPOSE 3000
# Build the project
CMD ["yarn", "start"]