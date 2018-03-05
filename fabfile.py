import fabric.api as fab
from json import load

fab.env.roledefs = {
    'prod': ['178.62.219.167'],
    'staging': ['192.168.1.2'],
}

DEPLOY_DIR = '/opt/powonline'


@fab.task
def develop():
    fab.local('npm install')


@fab.task
def build(with_docker_image=True):
    fab.local('npm run build')
    if with_docker_image:
        fab.local('docker build '
                  '-t exhuma/powonline-frontend:latest '
                  '.')


@fab.task
def deploy():
    with open('package.json') as fptr:
        package = load(fptr)
    version = package['version']
    fab.execute(build, with_docker_image=False)
    tmpdir = fab.run('mktemp -d')
    fab.put('dist', tmpdir)
    fab.put('Dockerfile', tmpdir)
    fab.put('nginx.conf', tmpdir)
    try:
        with fab.cd(tmpdir):
            fab.run('docker build '
                    '-t exhuma/powonline-frontend:latest '
                    '-t exhuma/powonline-frontend:%s '
                    '.' % version)
    finally:
        fab.run('rm -rf %s' % tmpdir)

    exists = fab.run('[ -d %s ] && echo 1 || echo 0' % DEPLOY_DIR).strip()
    if exists == '0':
        fab.sudo('install -o %s -d %s' % (fab.env.user, DEPLOY_DIR))
    fab.run('docker stop powonline-frontend')
    fab.run('docker rm powonline-frontend')
    fab.put('run-frontend.sh', '%s/run-frontend.sh.dist' % DEPLOY_DIR)
    with fab.cd(DEPLOY_DIR):
        fab.run('bash run-frontend.sh')


@fab.task
def run():
    fab.local('HOST=0.0.0.0 npm run dev')
