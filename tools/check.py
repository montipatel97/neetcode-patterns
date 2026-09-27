"""Print each traced example's return value, for spot-checking against the PDF."""
import io, json, os, sys

DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'topics')

def flat(r):
    if r.get('kind') == 'scalar':
        return r.get('repr')
    if r.get('kind') in ('list', 'tuple'):
        return '[' + ', '.join(flat(i) for i in r.get('items', [])) + ']'
    if r.get('kind') == 'set':
        return '{' + ', '.join(flat(i) for i in r.get('items', [])) + '}'
    if r.get('kind') == 'dict':
        return '{' + ', '.join('%s: %s' % (k, flat(v)) for k, v in r.get('entries', [])) + '}'
    return str(r.get('repr', r))

names = sys.argv[1:] or sorted(
    f[:-10] for f in os.listdir(os.path.normpath(DATA)) if f.endswith('.traces.js'))
for name in names:
    p = os.path.normpath(os.path.join(DATA, name + '.traces.js'))
    if not os.path.exists(p):
        continue
    s = io.open(p, encoding='utf-8').read()
    d = json.loads(s.split('] = ', 1)[1].rstrip().rstrip(';'))
    print('%s  (%s)' % (d['title'], d['number']))
    for e in d['examples']:
        print('   %-28s %-9s -> %s' % (e['id'], '%d steps' % len(e['steps']), flat(e['result'])))
