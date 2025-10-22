# Set the application name
oc project jackie

# Create a new build config using the remote image
oc new-app registry.redhat.io/ubi8/nodejs-20:latest --name=sso-playground https://github.com/xiujungao/sso-playground.git --strategy=source

# This step can be break down into two steps:
# oc create imagestream sso-playground
# oc create buildconfig sso-playground \
#  --image-stream=registry.redhat.io/ubi8/nodejs-20:latest \
#  --strategy=source \
#  --source-repo=https://github.com/xiujungao/sso-playground.git \
#  --to-image-stream=sso-playground:latest



# Monitor the build
# This may take a few minutes the first time, as it clones the repo, runs Maven (or Gradle if applicable), and builds the image
oc logs -f buildconfig/sso-playground

# Once the build succeeds, the app will deploy as a pod. Check the status
oc get pods

# Next.js standalone honors PORT; S2I defaults to 8080, keep it consistent:
oc set env deploy/sso-playground NEXT_PUBLIC_REDIRECT_URI=http://sso-playground-jackie.apps-crc.testing PORT=8080 HOST=0.0.0.0

# Set additional environment variables
# Auth.js (NextAuth v5 beta) refuses requests unless the host is trusted
oc -n jackie set env deploy/nextjs-dashboard AUTH_TRUST_HOST=true NEXTAUTH_URL=https://nextjs-dashboard-jackie.apps-crc.testing AUTH_URL=https://nextjs-dashboard-jackie.apps-crc.testing
oc rollout restart deploy/nextjs-dashboard -n jackie
oc rollout status deploy/nextjs-dashboard -n jackie

# Expose a route to access the app
# this will be http, not https
# oc expose svc/sso-playground
# this will be https with edge termination, https stopped at the router, from router to pod is http  
# 8080-tcp is the port name in service.yaml
# the url will be like: https://sso-playground-http-jackie.apps-crc.testing
oc create route edge sso-playground-http --service=sso-playground --port=8080-tcp --insecure-policy=Redirect 

# this will be https with re-encrypt termination, https from client to router, https from router to pod
# 1. make sure the service has the annotation to use the serving cert secret
oc annotate service sso-playground 'service.beta.openshift.io/serving-cert-secret-name=sso-serving-cert' --overwrite 
# 2. add the volume to the deployment to mount the serving cert secret
oc set volume deployment/sso-playground --add --name=serving-cert --type=secret --secret-name=sso-serving-cert --mount-path=/etc/tls --read-only=true
# 3. map port 8443 to 8443 in the service
oc patch svc/sso-playground --type='json' -p="[{'op': 'add', 'path': '/spec/ports/-', 'value': {'name': '8443-tcp', 'port': 8443, 'targetPort': 8443, 'protocol': 'TCP'}}]"
oc create route reencrypt sso-playground --service=sso-playground --port=8443-tcp --insecure-policy=Redirect -n jackie


oc get route sso-playground -n jackie -o jsonpath="{.spec.host}{'\n'}"
oc get endpoints sso-playground -n jackie


# Get the URL of the app
# NAME          HOST/PORT                             PATH   SERVICES      PORT       TERMINATION   WILDCARD
# hello-world   hello-world-jackie.apps-crc.testing          hello-world   8080-tcp                 None
oc get route sso-playground


# after make change to the code, you can run the following command to trigger a new build
# after the buld is done, you can access the app at the URL provided by the route command
# nothing else to do, the app will be automatically redeployed
oc start-build $AppName --follow -n jackie

# Scale the deployment to have 2 replicas 
oc autoscale deployment $AppName  --cpu-percent=80 --min=2 --max=10


# Alternative: Create a new app directly from the image stream (if already built)
oc new-app sso-playground --name=sso-playground