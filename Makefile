sha := $(shell git rev-parse --short=7 HEAD)
release_version := `cat VERSION`
build_date ?= $(shell git show -s --date=iso8601-strict --pretty=format:%cd $$sha)
dockerhub_image := codecov/self-hosted-frontend
ENV ?= ENTERPRISE
export DOCKER_BUILDKIT := 1

build.local:
	docker build -f docker/Dockerfile . -t ${dockerhub_image}:latest --build-arg REACT_APP_STAGE=development --build-arg REACT_APP_CODECOV_VERSION=${release_version} --build-arg REACT_APP_ENV_ARG=development

build:
	docker build -f docker/Dockerfile . -t ${dockerhub_image}:rolling -t ${dockerhub_image}:${release_version}-${sha} \
	--build-arg REACT_APP_STAGE=${ENV} \
	--build-arg REACT_APP_CODECOV_VERSION=${release_version} \
	--build-arg REACT_APP_ENV_ARG=${ENV} \
	--label "org.label-schema.build-date"="$(build_date)" \
	--label "org.label-schema.name"="Self-Hosted Frontend" \
	--label "org.label-schema.vendor"="Codecov" \
	--label "org.label-schema.version"="${release_version}-${sha}" \
	--squash

push:
	docker push ${dockerhub_image}:rolling

release:
	docker tag ${dockerhub_image}:${release_version}-${sha} ${dockerhub_image}:${release_version}
	docker tag ${dockerhub_image}:${release_version}-${sha} ${dockerhub_image}:latest-stable
	docker tag ${dockerhub_image}:${release_version}-${sha} ${dockerhub_image}:latest-calver
	docker push ${dockerhub_image}:${release_version}
	docker push ${dockerhub_image}:latest-stable
	docker push ${dockerhub_image}:latest-calver
