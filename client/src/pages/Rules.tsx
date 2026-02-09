/*
 * Rules Page
 * Wabi-Sabi design: Clean typography, natural spacing, contemplative reading experience
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/language-context";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Rules() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const rules = [
    { title: t.rules.standardGo, text: t.rules.standardGoText },
    { title: t.rules.lineGo, text: t.rules.lineGoText },
    { title: t.rules.monoGo, text: t.rules.monoGoText },
    { title: t.rules.toroidGo, text: t.rules.toroidGoText },
    { title: t.rules.magneticGo, text: t.rules.magneticGoText },
    { title: t.rules.tricolorGo, text: t.rules.tricolorGoText },
  ];

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

      <main className="container py-8 max-w-3xl mx-auto">
        <Card className="wabi-shadow-lg bg-card/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl">{t.rules.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {rules.map((rule, index) => (
              <div key={index} className="space-y-3">
                <h3 className="text-xl font-medium text-accent">{rule.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{rule.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
