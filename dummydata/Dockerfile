FROM node:8.9.4
# copy files from current folder to container folder

COPY . .

# install npm under production env so dev dependencies dont get installed
ENV NODE_ENV=development
ENV IS_DOCKER=true
# RUN  apt-get update && apt-get install -y && apt-get install python-pip -y &&  pip install cqlsh
# get java
RUN echo "deb http://ppa.launchpad.net/webupd8team/java/ubuntu xenial main" |  tee /etc/apt/sources.list.d/webupd8team-java.list
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys EEA14886
RUN apt-get update
RUN echo debconf shared/accepted-oracle-license-v1-1 select true | debconf-set-selections
RUN echo debconf shared/accepted-oracle-license-v1-1 seen true | debconf-set-selections
RUN apt-get install oracle-java8-installer -y

#cassandra
RUN echo "deb http://www.apache.org/dist/cassandra/debian 311x main" | tee -a /etc/apt/sources.list.d/cassandra.sources.list
RUN curl https://www.apache.org/dist/cassandra/KEYS | apt-key add -
# RUN gpg --keyserver pgp.mit.edu --recv-keys 749D6EEC0353B12C
RUN apt-get update
RUN apt-get install cassandra -y --force-yes
RUN npm install

# node start up
CMD node megaseed.js --db=cassandra