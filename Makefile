sha := $(shell git rev-parse --short=7 HEAD)
release_version := '24.10.1'
build_date ?= $(shell git show -s --date=iso8601-strict --pretty=format:%cd $$sha)
dockerhub_image := sunci/self-hosted-frontend
ENV ?= ENTERPRISE
export DOCKER_BUILDKIT := 1

build.local:
	docker build -f docker/Dockerfile . -t ${dockerhub_image}:latest --build-arg REACT_APP_STAGE=development --build-arg REACT_APP_CODECOV_VERSION=${release_version} --build-arg REACT_APP_ENV_ARG=development

build.self-hosted:
	docker build -f docker/Dockerfile . -t ${dockerhub_image}:rolling \
	-t ${dockerhub_image}:${release_version}-${sha} \
	--build-arg REACT_APP_STAGE=${ENV} \
	--build-arg REACT_APP_CODECOV_VERSION=${release_version} \
	--build-arg REACT_APP_ENV_ARG=${ENV} \
	--label "org.label-schema.build-date"="$(build_date)" \
	--label "org.label-schema.name"="Self-Hosted Frontend" \
	--label "org.label-schema.vendor"="Codecov" \
	--label "org.label-schema.version"="${release_version}-${sha}"

tag.self-hosted-rolling:
	docker tag ${dockerhub_image}:${release_version}-${sha} ${dockerhub_image}:rolling

push.self-hosted-rolling:
	docker push ${dockerhub_image}:rolling

save.self-hosted:
	docker save -o self-hosted.tar ${dockerhub_image}:${release_version}-${sha}

load.self-hosted:
	docker load --input self-hosted.tar

tag.self-hosted-release:
	docker tag ${dockerhub_image}:${release_version}-${sha} ${dockerhub_image}:${release_version}
	docker tag ${dockerhub_image}:${release_version}-${sha} ${dockerhub_image}:latest-stable
	docker tag ${dockerhub_image}:${release_version}-${sha} ${dockerhub_image}:latest-calver

push.self-hosted-release:
	docker push ${dockerhub_image}:${release_version}
	docker push ${dockerhub_image}:latest-stable
	docker push ${dockerhub_image}:latest-calver

test_env.install_cli:
	pip install --no-cache-dir codecov-cli
