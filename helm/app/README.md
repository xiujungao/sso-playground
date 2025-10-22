# SSO Playground Helm Chart

The helm chart installs k8s objects with the release name `sso-playground`.

## Installing the Chart

To install the chart on a specific namespace.

```bash
$ make install namespace=<namespace>
```

To upgrade the chart on a specific namespace.

```bash
$ make upgrade namespace=<namespace>
```

To uninstall the chart on a specific namespace.

```bash
$ make uninstall namespace=<namespace>
```

To lint the chart on a specific namespace.

```bash
$ make lint namespace=<namespace>
```
