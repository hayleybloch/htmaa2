deploy_local.sh

Helper to build the static site and push to GitLab.

Usage (macOS / Linux):

1. Make the helper executable:
   chmod +x scripts/deploy_local.sh

2. Run it with GITLAB_REPO set (SSH or HTTPS):
   GITLAB_REPO="ssh://git@gitlab.cba.mit.edu:846/classes/863.25/people/HayleyBloch.git" ./scripts/deploy_local.sh

If you prefer HTTPS with a token:
   GITLAB_REPO="https://gitlab.cba.mit.edu/classes/.../HayleyBloch.git" GITLAB_TOKEN="glpat-xxxx" ./scripts/deploy_local.sh

The script will prompt for confirmation before building and pushing. It relies on the existing project scripts (`build:static` and `push_to_gitlab.sh`).