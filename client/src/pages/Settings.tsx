/*
 * Settings Page
 * Wabi-Sabi design: Simple, functional, with natural spacing
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/language-context";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Settings() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  return (
    <div 
      className="min-h-screen paper-texture"
      style={{
        backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/oZItJG8Pi4pSg6byyTzLUB/sandbox/Iz4HeWdS0k5BbrvPTSHBXR-img-1_1770622221000_na1fn_aGVyby1iYWNrZ3JvdW5k.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvb1pJdEpHOFBpNHBTZzZieXlUekxVQi9zYW5kYm94L0l6NEhlV2RTMGs1QmJydlBUU0hCWFItaW1nLTFfMTc3MDYyMjIyMTAwMF9uYTFmbl9hR1Z5YnkxaVlXTnJaM0p2ZFc1ay5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=iu2zqhdoRkGuoME4u8u3Bv07L8fogfF0U3xHjWyGuXF-I83DvgnY9AkykTsujVqG7nD1EVkN~5EOoZHRLH2KJU8OA3CM4MytdK75lQvWLrIKb9VS2dJXSNVbGgPoC-eq3Z~v2zNpPPUuJOv3l6dS0uCRXqioWxn3SPHytt3lqNVI7pUfUkrwlc6kdlbFKiYrmuOOHC2lNNCyk9hTZDTM83wyRNKQXyBKvTNG-i1FfMch85Vf7zDHkw-Z~IwLDX1b5lnSUAHYgEtjDvr5bbkl6PPIzbtTUGE~VUMbmB-ifqc6bmj8ZEy7U3FFwgDXgBtH4vLGxe0EQIgYI1tcCr3jiw__')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <header className="container py-6">
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="ink-transition"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.game.backHome}
        </Button>
      </header>

      <main className="container py-8 max-w-2xl mx-auto">
        <Card className="wabi-shadow-lg bg-card/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl">{t.settings.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t.settings.about}</h3>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {t.settings.aboutText}
              </p>
              <p className="text-sm text-muted-foreground">{t.settings.version}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
