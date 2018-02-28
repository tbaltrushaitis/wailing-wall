##  ------------------------------------------------------------------------  ##
##                                Build Project                               ##
##  ------------------------------------------------------------------------  ##

# .SILENT:

.EXPORT_ALL_VARIABLES:

# .IGNORE:
##  ------------------------------------------------------------------------  ##

APP_NAME := "wailing-wall"
APP_LOGO := ./assets/BANNER

REPO_HOST := https://github.com
REPO_USER := tbaltrushaitis
REPO_URL := $(shell git ls-remote --get-url)
GIT_COMMIT := $(shell git rev-list --remove-empty --remotes --max-count=1 --date-order --reverse)
APP_REPO := ${REPO_HOST}/${REPO_USER}/${APP_NAME}.git

APP_ENV := $(shell cat NODE_ENV)
CODE_VERSION := $(shell cat ./VERSION)
APP_BRANCH := "${APP_ENV}-${CODE_VERSION}"

WD := $(shell pwd -P)
APP_DIRS := $(addprefix ${WD}/,build-* dist-* webroot)

DT = $(shell date +'%Y%m%d%H%M%S')

include ./bin/.bash_colors

##  ------------------------------------------------------------------------  ##

COMMIT_EXISTS := $(shell [ -e COMMIT ] && echo 1 || echo 0)
ifeq ($(COMMIT_EXISTS), 0)
$(file > COMMIT,${GIT_COMMIT})
$(warning ${BYellow}[${DT}] Created file [COMMIT]${NC})
endif
DIR_COMMIT := ${GIT_COMMIT}

DIR_SRC := ${WD}/src
DIR_BUILD := ${WD}/build-${CODE_VERSION}
DIR_DIST := ${WD}/dist-${CODE_VERSION}
DIR_WEB := ${WD}/webroot

##  ------------------------------------------------------------------------  ##
# Query the default goal.

ifeq ($(.DEFAULT_GOAL),)
.DEFAULT_GOAL := default
endif

##  ------------------------------------------------------------------------  ##
##                                  INCLUDES                                  ##
##  ------------------------------------------------------------------------  ##

include ./bin/Makefile.*

##  ------------------------------------------------------------------------  ##

.PHONY: default

default: all;

##  ------------------------------------------------------------------------  ##

.PHONY: test

test: banner state help banner;

##  ------------------------------------------------------------------------  ##

.PHONY: clone

clone:
	@  git clone -b ${APP_BRANCH} ${APP_REPO} 	\
	&& cd ${APP_NAME} 	\
	&& git pull 	\
	&& find . -type f -exec chmod 664 {} \; 	\
	&& find . -type d -exec chmod 775 {} \; 	\
	&& find . -type f -name "*.sh" -exec chmod 755 {} \;

##  ------------------------------------------------------------------------  ##

.PHONY: banner

banner:
	@ if [ -f "${APP_LOGO}" ]; then cat "${APP_LOGO}"; fi

##  ------------------------------------------------------------------------  ##

.PHONY: clean clean-all
.PHONY: clean-repo clean-src clean-deps
.PHONY: clean-build clean-dist clean-web clean-stuff

clean-all: clean clean-web clean-stuff

clean: clean-build clean-dist

clean-repo:
	@ ${RM} -rf ${APP_NAME}

clean-src:
	@ ${RM} ${DIR_SRC}

clean-build:
	@ rm -rf ${DIR_BUILD}

clean-dist:
	@ rm -rf ${DIR_DIST}

clean-web:
	@ rm -rf ${DIR_WEB}

clean-deps:
	@ rm -rf bower_modules/ \
					node_modules/  ;

clean-stuff:
	@ rm -rf ${APP_DIRS} \
		bitbucket-pipelines.yml \
		codeclimate-config.patch \
		_config.yml;

##  ------------------------------------------------------------------------  ##

.PHONY: rights

rights:
	@ find . -type f -exec chmod 664 {} 2>/dev/null \;
	@ find . -type d -exec chmod 775 {} 2>/dev/null \;
	@ find . -type f -name "*.sh" -exec chmod a+x {} 2>/dev/null \;

##  ------------------------------------------------------------------------  ##

.PHONY: setup build deploy dev

setup:
	@ npm i
	@ bower i --verbose

build:
	@ gulp build

deploy:
	@ gulp deploy

##  ------------------------------------------------------------------------  ##

.PHONY: rebuild redeploy

rebuild: build;

redeploy: rebuild deploy;

##  ------------------------------------------------------------------------  ##

.PHONY: all full cycle
#* means the word "all" doesn't represent a file name in this Makefile;
#* means the Makefile has nothing to do with a file called "all" in the same directory.

all: banner clean cycle banner;

full: clean-all all;

cycle: rights setup build deploy;

##  ------------------------------------------------------------------------  ##
