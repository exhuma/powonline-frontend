import fabric.api as fab

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
    fab.execute(build, with_docker_image=False)
    tmpdir = fab.run('mktemp -d')
    fab.put('dist', tmpdir)
    fab.put('Dockerfile', tmpdir)
    fab.put('nginx.conf', tmpdir)
    try:
        with fab.cd(tmpdir):
            fab.run('docker build '
                    '-t exhuma/powonline-frontend:latest '
                    '.')
    finally:
        fab.run('rm -rf %s' % tmpdir)


@fab.task
def run():
    fab.local('npm run dev')
