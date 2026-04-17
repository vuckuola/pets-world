#!/usr/bin/env python3
"""Expand animals.json to 200+ animals. Part 2 - appended to expand.py"""
import json, sys

with open("src/data/animals.json") as f:
    animals = json.load(f)

existing = set(a["slug"] for a in animals)
print(f"Existing: {len(animals)} animals")

CC = {"South Africa":"za","Kenya":"ke","Tanzania":"tz","Madagascar":"mg","Egypt":"eg","Uganda":"ug","Namibia":"na","Botswana":"bw","Morocco":"ma","Ethiopia":"et","Rwanda":"rw","Congo":"cd","Cameroon":"cm","Senegal":"sn","Mozambique":"mz","India":"in","Japan":"jp","Philippines":"ph","Malaysia":"my","Thailand":"th","Cambodia":"kh","Nepal":"np","Singapore":"sg","Bhutan":"bt","Brazil":"br","Mexico":"mx","Canada":"ca","United States":"us","Colombia":"co","Ecuador":"ec","Chile":"cl","Argentina":"ar","Costa Rica":"cr","Bolivia":"bo","Venezuela":"ve","United Kingdom":"gb","France":"fr","Germany":"de","Sweden":"se","Norway":"no","Spain":"es","Italy":"it","Greece":"gr","Poland":"pl","Romania":"ro","Iceland":"is","Finland":"fi","Netherlands":"nl","Ireland":"ie","Australia":"au","New Zealand":"nz","Papua New Guinea":"pg","Fiji":"fj","Saudi Arabia":"sa","United Arab Emirates":"ae","Oman":"om","Israel":"il","Jordan":"jo","Yemen":"ye","Iran":"ir","Turkey":"tr","Svalbard":"sj","Greenland":"gl","Antarctica":"aq","Russia":"ru","Sri Lanka":"lk","Nigeria":"ng"}

def flag(c):
    return "".join(chr(0x1F1E6+ord(x)-97) for x in CC.get(c,"xx"))

def iucn(s):
    return {"EX":"Extinct","EW":"Extinct in the Wild","CR":"Critically Endangered","EN":"Endangered","VU":"Vulnerable","NT":"Near Threatened","LC":"Least Concern","DD":"Data Deficient"}.get(s,s)

def mk(slug,cm,sn,cl,ord,fam,gen,iuc,diet,lmin,lmax,wmin,wmax,reg,cntry,lat,lng,desc,emoji,facts,pop=""):
    cm2 = {"Mammalia":"Mammal","Aves":"Bird","Reptilia":"Reptile","Amphibia":"Amphibian","Chondrichthyes":"Fish","Actinopterygii":"Fish","Insecta":"Insect"}
    hab = desc.split("inhabits ")[1].rstrip(".") if "inhabits " in desc else "Native habitat"
    return {"id":CC.get(cntry,"xx"),"slug":slug,"commonName":cm,"scientificName":sn,"taxonomy":{"kingdom":"Animalia","phylum":"Chordata","class":cl,"order":ord,"family":fam,"genus":gen},"iucnStatus":iuc,"description":desc,"habitat":[hab.lower()],"diet":diet,"lifespan":{"min":lmin,"max":lmax,"unit":"years"},"weight":{"min":wmin,"max":wmax,"unit":"kg"},"nativeRegions":[reg],"coordinates":[{"lat":lat,"lng":lng,"label":cntry}],"images":[],"funFacts":facts,"wikiUrl":f"https://en.wikipedia.org/wiki/{cm.replace(' ','_')}","updatedAt":"2026-04-17T00:00:00Z","country":cntry,"flag":flag(cntry),"region":reg,"animal":cm,"emoji":emoji,"classification":cm2.get(cl,cl),"conservationStatus":iucn(iuc),"indigenous":True,"habitatOld":hab,"population":pop}

N = []
# We build all new animals then append
exec(open("scripts/animals_data.py").read())

# Filter out duplicates
new = [a for a in N if a["slug"] not in existing]
print(f"Adding {len(new)} new animals")

animals.extend(new)

# Fix locale
# (done separately)

with open("src/data/animals.json","w") as f:
    json.dump(animals, f, ensure_ascii=False, indent=2)
print(f"Total: {len(animals)} animals written")
