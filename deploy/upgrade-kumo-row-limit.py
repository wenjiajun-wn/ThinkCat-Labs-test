"""Apply the reviewed 500 -> 10000 row limit change; never restart a service."""
import argparse
import hashlib
import os
from pathlib import Path
import shutil
import tempfile
from datetime import datetime, timezone


EXPECTED_SHA256 = '162d017711289e5c29595ff132afd1796b641e0ecaf12ac57cf1b8db8a04314b'
REPLACEMENTS = (
    ('if not 20 <= len(df) <= 500:', 'if not 20 <= len(df) <= 10000:'),
    ('"Requires 20-500 rows"', '"Requires 20-10000 rows"'),
)


def prepare(original):
    if hashlib.sha256(original).hexdigest() != EXPECTED_SHA256:
        raise ValueError('Source checksum differs from the tested app.py; no changes made.')
    source = original.decode('utf-8')
    for old, new in REPLACEMENTS:
        if source.count(old) != 1:
            raise ValueError('Expected exactly one row guard and error message.')
        source = source.replace(old, new, 1)
    compile(source, 'app.py', 'exec')
    return source.encode('utf-8')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--app', type=Path, default=Path('/root/kumo-api/app.py'))
    parser.add_argument('--apply', action='store_true', help='Write the verified change with a backup.')
    args = parser.parse_args()
    path = args.app
    if path.is_symlink():
        raise ValueError('Refusing a symlink; inspect the actual app path first.')
    original = path.read_bytes()
    updated = prepare(original)
    print('Verified source. Only total row limit and its error message will change: 500 -> 10000.')
    print('Query limit remains 50; feature limit remains 30; model call and response are unchanged.')
    if not args.apply:
        print('Check only. Run with --apply to write the change.')
        return
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    backup = path.with_name(f'{path.name}.before-10000.{stamp}.bak')
    stat = path.stat()
    with backup.open('xb') as stream:
        stream.write(original)
        stream.flush()
        os.fsync(stream.fileno())
    shutil.copystat(path, backup)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(dir=path.parent, prefix='.app-row-limit-', delete=False) as stream:
            temporary = Path(stream.name)
            stream.write(updated)
            stream.flush()
            os.fsync(stream.fileno())
        shutil.copystat(path, temporary)
        if hasattr(os, 'chown'):
            os.chown(temporary, stat.st_uid, stat.st_gid)
        if path.read_bytes() != original:
            raise RuntimeError('app.py changed during preparation; replacement cancelled.')
        os.replace(temporary, path)
        print(f'Backup: {backup}')
        print(f'Updated SHA256: {hashlib.sha256(updated).hexdigest()}')
        print('File updated. Running service is unchanged until its managed restart.')
    finally:
        if temporary is not None and temporary.exists():
            temporary.unlink()


if __name__ == '__main__':
    main()
