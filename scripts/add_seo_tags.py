#!/usr/bin/env python3
"""
Skript zum Hinzufügen von SEO Meta-Tags zu allen HTML-Dateien
"""

import os
import re
from pathlib import Path

# Basis-URL der Website
BASE_URL = "https://blog.bildungsluecke.xyz"

# Standard OG Image (kann später durch spezifische Bilder ersetzt werden)
DEFAULT_OG_IMAGE = f"{BASE_URL}/og-image.jpg"

# Meta-Tags, die hinzugefügt werden sollen
SEO_TAGS_TEMPLATE = """
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="{og_url}" />
    <meta property="og:title" content="{og_title}" />
    <meta property="og:description" content="{og_description}" />
    <meta property="og:image" content="{og_image}" />
    <meta property="og:site_name" content="Bildungslücke" />
    <meta property="og:locale" content="de_DE" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{twitter_title}" />
    <meta name="twitter:description" content="{twitter_description}" />
    <meta name="twitter:image" content="{twitter_image}" />
    <meta name="twitter:site" content="@Bildungsluecke" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="{canonical_url}" />
    
    <!-- Additional SEO -->
    <meta name="robots" content="index, follow" />
    <meta name="author" content="Bildungslücke" />
"""

# Seiten-spezifische Meta-Daten
PAGES_META = {
    "index.html": {
        "title": "Bildungslücke - Lernen, denken, verstehen",
        "description": "Bildungslücke ist ein Projekt für digitale Mündigkeit: Desinformation, kritisches Denken, Betrugsmaschen und hybride Einflussnahme verständlich erklärt.",
        "url": f"{BASE_URL}/",
        "image": DEFAULT_OG_IMAGE
    },
    "site1/index.html": {
        "title": "Fake News – Warum Lügen schneller reisen als die Wahrheit",
        "description": "Eine fundierte Recherche zum Thema Desinformation: wie Falschmeldungen entstehen, welche Mechanismen hinter ihnen stecken und wie du dich gegen gezielte Manipulation schützen kannst.",
        "url": f"{BASE_URL}/site1/",
        "image": DEFAULT_OG_IMAGE
    },
    "site2/index.html": {
        "title": "Denken vor Handeln – Klar denken, bewusster handeln",
        "description": "Wie synthetische Medien und Deepfakes unser Wirklichkeitsgefühl verändern – und was wir dagegen tun können.",
        "url": f"{BASE_URL}/site2/",
        "image": DEFAULT_OG_IMAGE
    },
    "site3/index.html": {
        "title": "⚠️ Betrugswarnung – SMS-Phishing bei Banken",
        "description": "Eine kompakte Warnseite zu aktuellen Betrugsmaschen per SMS – inkl. einem echten Fall, bei dem 99.571 € innerhalb von 12 Minuten verloren wurden.",
        "url": f"{BASE_URL}/site3/",
        "image": DEFAULT_OG_IMAGE
    },
    "site4/index.html": {
        "title": "Schaulust im Netz – Wenn Leid zum Klick wird",
        "description": "Eine dokumentarisch angelegte Recherche über Schaulust, Wahrnehmung und psychologische Mechanismen im digitalen Raum.",
        "url": f"{BASE_URL}/site4/",
        "image": DEFAULT_OG_IMAGE
    },
    "site5/index.html": {
        "title": "Voice-Cloning Aufklärung | Sicherheit im Netz",
        "description": "Wie Voice-Cloning funktioniert, welche Betrugsmaschen damit genutzt werden und wie man sich im Alltag wirksam schützt.",
        "url": f"{BASE_URL}/site5/",
        "image": DEFAULT_OG_IMAGE
    },
    "site6/index.html": {
        "title": "Hybride Einflussnahme aus Russland: Desinformation, Wahlbeeinflussung und öffentliche Meinung",
        "description": "Wie russische Desinformationskampagnen demokratische Debatten in Deutschland beeinflussen wollen – Methoden, Warnzeichen und was wir dagegen tun können.",
        "url": f"{BASE_URL}/site6/",
        "image": DEFAULT_OG_IMAGE
    },
    "site7/index.html": {
        "title": "KI-Bots bei YouTube – Wie Algorithmen Meinung machen",
        "description": "Bots klingen dank KI immer mehr wie echte Menschen. Sie erzeugen künstliche Mehrheiten, bringen echte Meinungen zum Schweigen und manipulieren Diskussionen – unerkannt. Eine Recherche von Quarks und NDR.",
        "url": f"{BASE_URL}/site7/",
        "image": DEFAULT_OG_IMAGE
    },
    "site8/index.html": {
        "title": "Demokratie im digitalen Wandel – KI, Social Media & der EU AI Act",
        "description": "Algorithmen kuratieren unsere Wirklichkeit, Bots verstärken Empörung, der EU AI Act setzt erstmals Leitplanken. Eine evidenzbasierte Bestandsaufnahme zu Desinformation, Polarisierung und digitaler Resilienz.",
        "url": f"{BASE_URL}/site8/",
        "image": DEFAULT_OG_IMAGE
    }
}

def add_seo_tags_to_file(filepath, meta_data):
    """Fügt SEO Meta-Tags zu einer HTML-Datei hinzu"""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Prüfen, ob SEO-Tags bereits vorhanden sind
    if '<meta property="og:url"' in content:
        print(f"✓ {filepath} - SEO Tags bereits vorhanden")
        return False
    
    # Meta-Tags generieren
    seo_tags = SEO_TAGS_TEMPLATE.format(
        og_url=meta_data["url"],
        og_title=meta_data["title"],
        og_description=meta_data["description"],
        og_image=meta_data["image"],
        twitter_title=meta_data["title"],
        twitter_description=meta_data["description"],
        twitter_image=meta_data["image"],
        canonical_url=meta_data["url"]
    )
    
    # Finde die Position nach dem description Meta-Tag
    description_pattern = r'(<meta name="description" content="[^"]*" />)'
    match = re.search(description_pattern, content)
    
    if match:
        # Füge SEO-Tags nach dem description Tag ein
        new_content = content.replace(
            match.group(1),
            match.group(1) + '\n' + seo_tags
        )
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✓ {filepath} - SEO Tags hinzugefügt")
        return True
    else:
        print(f"✗ {filepath} - Kein description Meta-Tag gefunden")
        return False

def main():
    """Hauptfunktion"""
    print("Füge SEO Meta-Tags zu allen HTML-Dateien hinzu...\n")
    
    # Verarbeite alle HTML-Dateien
    files_to_process = [
        "index.html",
        "site1/index.html",
        "site2/index.html",
        "site3/index.html",
        "site4/index.html",
        "site5/index.html",
        "site6/index.html",
        "site7/index.html",
        "site8/index.html"
    ]
    
    updated_count = 0
    for filepath in files_to_process:
        if os.path.exists(filepath):
            # Bestimme die passenden Meta-Daten
            if filepath in PAGES_META:
                meta_data = PAGES_META[filepath]
            elif filepath == "index.html":
                meta_data = PAGES_META["index.html"]
            else:
                # Fallback für unbekannte Dateien
                meta_data = PAGES_META["index.html"]
            
            if add_seo_tags_to_file(filepath, meta_data):
                updated_count += 1
        else:
            print(f"✗ {filepath} - Datei nicht gefunden")
    
    print(f"\n✅ Fertig! {updated_count} Dateien aktualisiert.")

if __name__ == "__main__":
    main()
