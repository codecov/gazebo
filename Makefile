sha := $(shell git rev-parse --short=7 HEAD)
release_version := `cat VERSION`
build_date ?= $(shell git show -s --date=iso8601-strict --pretty=format:%cd $$sha)
image := us-docker.pkg.dev/genuine-polymer-165712/codecov/codecov-frontend-gazebo
export DOCKER_BUILDKIT := 1

gcr.auth:
	gcloud auth configure-docker us-docker.pkg.dev

build.local:
	docker build . -t ${image}:latest --build-arg REACT_APP_STAGE=development

build:
	docker build . -t ${image}:${DEPLOY_ENV}-${release_version}-${sha} \
	--build-arg REACT_APP_STAGE=${BUILD_ENV} \
	--label "org.label-schema.build-date"="$(build_date)" \
	--label "org.label-schema.name"="Codecov Gazebo" \
	--label "org.label-schema.vendor"="Codecov" \
	--label "org.label-schema.version"="${release_version}-${sha}" \
	--squash

push:
	docker tag ${image}:${DEPLOY_ENV}-${release_version}-${sha} ${image}:${DEPLOY_ENV}-${release_version}-latest
	docker push ${image}:${DEPLOY_ENV}-${release_version}-${sha}
	docker push ${image}:${DEPLOY_ENV}-${release_version}-latest