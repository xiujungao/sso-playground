SHELL := /usr/bin/env bash

NAMESPACE=

.PHONY: install
install:
	helm install sso-playground . -n "${NAMESPACE}" -f values.yaml

.PHONY: upgrade
upgrade:
	helm upgrade --install sso-playground . -n "${NAMESPACE}" -f values.yaml

.PHONY: lint
lint:
	helm upgrade --dry-run --install sso-playground -n "${NAMESPACE}" -f values.yaml

.PHONY: uninstall
uninstall:
	helm uninstall sso-playground -n ${NAMESPACE}

.PHONY: force-install
force-install: uninstall
force-install: install
