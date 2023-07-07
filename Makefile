sha := $(shell git rev-parse --short=7 HEAD)
release_version := `cat VERSION`
build_date ?= $(shell git show -s --date=iso8601-strict --pretty=format:%cd $$sha)
# IMAGE, ENTERPRISE_IMAGE, and DEVOPS_IMAGE are provided via Github Actions. Engineers can refer to
# https://www.notion.so/sentry/Environment-variables-for-building-pushing-Docker-images-locally-3159e90c5e6f4db4bfbde8800cdad2c0?pvs=4
# for the relevant values. Open source users can set these to whatever tag names they want.
IMAGE := ${CODECOV_GAZEBO_IMAGE}
ENTERPRISE_IMAGE := ${CODECOV_GAZEBO_ENTERPRISE_IMAGE}
DEVOPS_IMAGE := ${CODECOV_GAZEBO_DEVOPS_IMAGE}
dockerhub_image := codecov/self-hosted-frontend
export DOCKER_BUILDKIT := 1

gcr.auth:
	gcloud auth configure-docker us-docker.pkg.dev

build.local:
	docker build -f docker/Dockerfile . -t ${IMAGE}:latest --build-arg REACT_APP_STAGE=development --build-arg REACT_APP_CODECOV_VERSION=${release_version} --build-arg REACT_APP_ENV_ARG=development

build.local.enterprise:
	docker build -f docker/Dockerfile . -t ${ENTERPRISE_IMAGE}:${release_version}-latest \
	--build-arg REACT_APP_STAGE=development \
	--build-arg REACT_APP_ENV_ARG=enterprise \
	--build-arg REACT_APP_CODECOV_VERSION=${release_version}

build:
	docker build -f docker/Dockerfile . -t ${IMAGE}:${ENV}-${release_version}-${sha} -t ${IMAGE}:${ENV}-${release_version}-latest \
	--build-arg REACT_APP_STAGE=${ENV} \
	--build-arg REACT_APP_CODECOV_VERSION=${release_version} \
	--build-arg REACT_APP_ENV_ARG=${ENV} \
	--label "org.label-schema.build-date"="$(build_date)" \
	--label "org.label-schema.name"="Codecov Gazebo" \
	--label "org.label-schema.vendor"="Codecov" \
	--label "org.label-schema.version"="${release_version}-${sha}" \
	--squash

build.enterprise:
	$(MAKE) build
	docker build -f docker/Dockerfile.enterprise . -t ${ENTERPRISE_IMAGE}:${release_version}-${sha} -t ${ENTERPRISE_IMAGE}:${release_version}-latest -t ${dockerhub_image}:rolling \
    	--build-arg FRONTEND_IMAGE=${IMAGE}:${ENV}-${release_version}-${sha} \
    	--label "org.label-schema.build-date"="$(build_date)" \
    	--label "org.label-schema.name"="Self-Hosted Frontend" \
    	--label "org.label-schema.vendor"="Codecov" \
    	--label "org.label-schema.version"="${release_version}-${sha}" \
    	--squash

push:
	docker push ${IMAGE}:${ENV}-${release_version}-${sha}
	docker push ${IMAGE}:${ENV}-${release_version}-latest

push.enterprise:
	docker push ${ENTERPRISE_IMAGE}:${release_version}-${sha}
	docker push ${ENTERPRISE_IMAGE}:${release_version}-latest

push.rolling:
	docker push ${dockerhub_image}:rolling

pull-for-release:
	docker pull ${ENTERPRISE_IMAGE}:${release_version}-${sha}

release:
	docker tag ${ENTERPRISE_IMAGE}:${release_version}-${sha} ${dockerhub_image}:${release_version}
	docker tag ${ENTERPRISE_IMAGE}:${release_version}-${sha} ${dockerhub_image}:latest-stable
	docker tag ${ENTERPRISE_IMAGE}:${release_version}-${sha} ${dockerhub_image}:latest-calver
	docker push ${dockerhub_image}:${release_version}
	docker push ${dockerhub_image}:latest-stable
	docker push ${dockerhub_image}:latest-calver

pull.devops:
	docker pull ${DEVOPS_IMAGE}

dive:
	$(MAKE) pull.devops
	docker run -e CI=true  -v /var/run/docker.sock:/var/run/docker.sock ${DEVOPS_IMAGE} dive ${IMAGE}:${ENV}-${release_version}-${sha} --lowestEfficiency=0.97 --highestUserWastedPercent=0.06

deep-dive:
	$(MAKE) pull.devops
	docker run -v /var/run/docker.sock:/var/run/docker.sock -v "$(shell pwd)":/tmp ${DEVOPS_IMAGE} /usr/bin/deep-dive -v --config /tmp/.deep-dive.yaml ${ENTERPRISE_IMAGE}:${release_version}-${sha}

tag.qa-release:
	git tag -a qa-${release_version}-${sha}-${EPOCH} -m "Autogenerated tag for enterprise frontend QA ${release_version} ${sha}"
	git push origin qa-${release_version}-${sha}-${EPOCH}