import urllib.request, json

resp = urllib.request.urlopen('https://mosq3.onrender.com/api/equipos/')
data = json.loads(resp.read().decode('utf-8'))

# Print ALL equipment names so we can see the actual softball name
for d in data:
    name = d['nombre']
    codepoints = [hex(ord(c)) for c in name]
    print(f"id={d['id']:>3} | {name:<30} | codepoints={codepoints}")
