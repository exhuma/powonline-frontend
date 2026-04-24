<template>
  <v-sheet>
    <v-tabs v-model="selectedLanguage" grow slider-color="yellow">
      <v-tab value="en" ripple>en</v-tab>
      <v-tab value="fr" ripple>fr</v-tab>
      <v-tab value="de" ripple>de</v-tab>
    </v-tabs>
    <v-tabs-window v-model="selectedLanguage">
      <!-- ═══════════════════════════════════════════════════════════ ENGLISH -->
      <v-tabs-window-item value="en">
        <v-card flat>
          <v-card-text class="text-xs-left">
            <h1>Terms of Service</h1>
            <p>Effective date: April 24, 2026</p>

            <p>
              Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully
              before using {{ siteUrl }} operated by {{ siteName }}
              (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;).
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Service you agree to be bound by these
              Terms and our
              <router-link to="/privacy-policy">Privacy Policy</router-link>. If
              you do not agree, do not use the Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              The Service is an event-management and real-time team-tracking
              platform for organised outdoor events. It enables event organisers
              to manage teams, routes, stations, scores, and uploads.
            </p>

            <h2>3. Accounts</h2>
            <ul>
              <li>
                You are responsible for maintaining the confidentiality of your
                account credentials.
              </li>
              <li>You must provide accurate information when registering.</li>
              <li>You must be at least 18 years old to create an account.</li>
              <li>
                You are responsible for all activity that occurs under your
                account.
              </li>
              <li>
                Notify us immediately at
                <a :href="'mailto:' + contactEmail">{{ contactEmail }}</a>
                if you suspect unauthorised use of your account.
              </li>
            </ul>

            <h2>4. Permitted Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>
                Upload content that is unlawful, harmful, threatening, abusive,
                defamatory, or otherwise objectionable.
              </li>
              <li>Impersonate any person or entity.</li>
              <li>Interfere with or disrupt the Service or servers.</li>
              <li>
                Attempt to gain unauthorised access to any portion of the
                Service.
              </li>
              <li>
                Use automated means to scrape or harvest data without our
                written consent.
              </li>
            </ul>

            <h2>5. User Content</h2>
            <p>
              You retain ownership of content you upload. By uploading content
              you grant us a non-exclusive, royalty-free licence to store and
              display it solely for the purpose of operating the Service. You
              represent that you have all necessary rights to the content you
              upload.
            </p>

            <h2>6. Account Deletion</h2>
            <p>
              You may delete your account at any time from the
              <router-link to="/account">Account Settings</router-link> page or
              by contacting us at
              <a :href="'mailto:' + contactEmail">{{ contactEmail }}</a
              >. Upon deletion, your personal data is erased in accordance with
              our
              <router-link to="/privacy-policy">Privacy Policy</router-link>.
            </p>

            <h2>7. Service Availability</h2>
            <p>
              We provide the Service on an &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo; basis. We do not guarantee uninterrupted or
              error-free operation. We reserve the right to modify, suspend, or
              discontinue the Service at any time with reasonable notice.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, {{ siteName }}
              shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages arising from your use of or
              inability to use the Service.
            </p>

            <h2>9. Third-Party Services</h2>
            <p>
              The Service may integrate with third-party identity providers
              (Google, GitHub, Microsoft, Facebook, OIDC). Your use of those
              services is subject to their respective terms and privacy
              policies. We are not responsible for third-party services.
            </p>

            <h2>10. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the Grand Duchy of
              Luxembourg. Any dispute shall be subject to the exclusive
              jurisdiction of the courts of Luxembourg City, unless mandatory
              consumer protection rules in your country of residence require
              otherwise.
            </p>

            <h2>11. Changes to These Terms</h2>
            <p>
              We may update these Terms. Continued use after changes are posted
              constitutes acceptance.
            </p>

            <h2>12. Contact</h2>
            <p>
              {{ siteName }} &mdash;
              <a :href="'mailto:' + contactEmail">{{ contactEmail }}</a>
            </p>
          </v-card-text>
        </v-card>
      </v-tabs-window-item>

      <!-- ══════════════════════════════════════════════════════════ FRANÇAIS -->
      <v-tabs-window-item value="fr">
        <v-card flat>
          <v-card-text class="text-xs-left">
            <h1>Conditions Générales d'Utilisation</h1>
            <p>Date de prise d'effet&nbsp;: 24 avril 2026</p>

            <p>
              Veuillez lire attentivement les présentes Conditions
              (&laquo;&nbsp;Conditions&nbsp;&raquo;) avant d'utiliser
              {{ siteUrl }} exploité par {{ siteName }}
              (&laquo;&nbsp;nous&nbsp;&raquo;).
            </p>

            <h2>1. Acceptation des Conditions</h2>
            <p>
              En accédant au Service ou en l'utilisant, vous acceptez d'être lié
              par les présentes Conditions et notre
              <router-link to="/privacy-policy"
                >Politique de Confidentialité</router-link
              >. Si vous n'acceptez pas ces Conditions, n'utilisez pas le
              Service.
            </p>

            <h2>2. Description du Service</h2>
            <p>
              Le Service est une plateforme de gestion d'événements et de suivi
              en temps réel d'équipes lors d'événements de plein air organisés.
            </p>

            <h2>3. Comptes</h2>
            <ul>
              <li>
                Vous êtes responsable de la confidentialité de vos identifiants.
              </li>
              <li>
                Vous devez fournir des informations exactes lors de
                l'inscription.
              </li>
              <li>Vous devez avoir au moins 18 ans pour créer un compte.</li>
              <li>
                Signalez toute utilisation non autorisée à
                <a :href="'mailto:' + contactEmail">{{ contactEmail }}</a
                >.
              </li>
            </ul>

            <h2>4. Utilisation autorisée</h2>
            <p>Vous vous engagez à ne pas&nbsp;:</p>
            <ul>
              <li>
                Téléverser des contenus illicites, nuisibles, diffamatoires ou
                répréhensibles.
              </li>
              <li>Usurper l'identité d'une personne ou d'une entité.</li>
              <li>Perturber ou interférer avec le Service.</li>
              <li>
                Tenter d'accéder sans autorisation à des parties du Service.
              </li>
              <li>
                Utiliser des moyens automatisés pour extraire des données sans
                notre consentement écrit.
              </li>
            </ul>

            <h2>5. Contenu utilisateur</h2>
            <p>
              Vous conservez la propriété des contenus que vous téléversez. En
              les téléversant, vous nous accordez une licence non exclusive et
              sans redevance pour les stocker et les afficher aux seules fins du
              Service.
            </p>

            <h2>6. Suppression de compte</h2>
            <p>
              Vous pouvez supprimer votre compte à tout moment depuis la page
              <router-link to="/account">Paramètres du compte</router-link> ou
              en nous contactant à
              <a :href="'mailto:' + contactEmail">{{ contactEmail }}</a
              >.
            </p>

            <h2>7. Disponibilité du Service</h2>
            <p>
              Le Service est fourni «&nbsp;tel quel&nbsp;». Nous nous réservons
              le droit de le modifier, de le suspendre ou d'y mettre fin avec un
              préavis raisonnable.
            </p>

            <h2>8. Limitation de responsabilité</h2>
            <p>
              Dans la limite autorisée par la loi applicable,
              {{ siteName }} ne saurait être tenu responsable de dommages
              indirects, accessoires, spéciaux ou consécutifs résultant de
              l'utilisation du Service.
            </p>

            <h2>9. Services tiers</h2>
            <p>
              Le Service peut s'intégrer avec des fournisseurs d'identité tiers
              (Google, GitHub, Microsoft, Facebook, OIDC). Votre utilisation de
              ces services est soumise à leurs propres conditions et politiques
              de confidentialité.
            </p>

            <h2>10. Loi applicable</h2>
            <p>
              Les présentes Conditions sont régies par le droit du Grand-Duché
              de Luxembourg. Tout litige relève de la compétence exclusive des
              tribunaux de Luxembourg-Ville.
            </p>

            <h2>11. Modifications</h2>
            <p>
              Nous pouvons mettre à jour ces Conditions. L'utilisation continue
              après la publication des modifications vaut acceptation.
            </p>

            <h2>12. Contact</h2>
            <p>
              {{ siteName }} &mdash;
              <a :href="'mailto:' + contactEmail">{{ contactEmail }}</a>
            </p>
          </v-card-text>
        </v-card>
      </v-tabs-window-item>

      <!-- ══════════════════════════════════════════════════════════ DEUTSCH -->
      <v-tabs-window-item value="de">
        <v-card flat>
          <v-card-text class="text-xs-left">
            <h1>Nutzungsbedingungen</h1>
            <p>Datum des Inkrafttretens: 24. April 2026</p>

            <p>
              Bitte lesen Sie diese Nutzungsbedingungen («Bedingungen»)
              sorgfältig, bevor Sie {{ siteUrl }} von {{ siteName }} («wir»,
              «uns», «unser») nutzen.
            </p>

            <h2>1. Annahme der Bedingungen</h2>
            <p>
              Durch den Zugriff auf den Dienst oder seine Nutzung erklären Sie
              sich mit diesen Bedingungen und unserer
              <router-link to="/privacy-policy"
                >Datenschutzerklärung</router-link
              >
              einverstanden.
            </p>

            <h2>2. Beschreibung des Dienstes</h2>
            <p>
              Der Dienst ist eine Veranstaltungsmanagement- und
              Echtzeit-Tracking-Plattform für organisierte
              Outdoor-Veranstaltungen.
            </p>

            <h2>3. Konten</h2>
            <ul>
              <li>
                Sie sind für die Vertraulichkeit Ihrer Zugangsdaten
                verantwortlich.
              </li>
              <li>Sie müssen bei der Registrierung genaue Angaben machen.</li>
              <li>
                Sie müssen mindestens 18 Jahre alt sein, um ein Konto zu
                erstellen.
              </li>
              <li>
                Melden Sie unbefugte Nutzung umgehend an
                <a :href="'mailto:' + contactEmail">{{ contactEmail }}</a
                >.
              </li>
            </ul>

            <h2>4. Zulässige Nutzung</h2>
            <p>Sie verpflichten sich, Folgendes zu unterlassen:</p>
            <ul>
              <li>
                Hochladen rechtswidriger, schädlicher, diffamierender oder
                anstößiger Inhalte.
              </li>
              <li>
                Identitätsbetrug oder falsche Darstellung Ihrer Zugehörigkeit.
              </li>
              <li>Störung des Dienstes oder der Server.</li>
              <li>Versuchter unbefugter Zugriff auf Teile des Dienstes.</li>
              <li>
                Nutzung automatisierter Mittel zur Datenerfassung ohne unsere
                schriftliche Zustimmung.
              </li>
            </ul>

            <h2>5. Nutzerinhalte</h2>
            <p>
              Sie behalten das Eigentum an hochgeladenen Inhalten. Durch das
              Hochladen räumen Sie uns eine nicht exklusive, gebührenfreie
              Lizenz zur Speicherung und Anzeige ausschließlich zum Betrieb des
              Dienstes ein.
            </p>

            <h2>6. Kontolöschung</h2>
            <p>
              Sie können Ihr Konto jederzeit über die
              <router-link to="/account">Kontoeinstellungen</router-link> oder
              per Kontakt an
              <a :href="'mailto:' + contactEmail">{{ contactEmail }}</a>
              löschen.
            </p>

            <h2>7. Dienstverfügbarkeit</h2>
            <p>
              Der Dienst wird «wie besehen» bereitgestellt. Wir behalten uns das
              Recht vor, den Dienst mit angemessener Vorankündigung zu ändern,
              auszusetzen oder einzustellen.
            </p>

            <h2>8. Haftungsbeschränkung</h2>
            <p>
              Im gesetzlich zulässigen Rahmen haftet {{ siteName }} nicht für
              indirekte, zufällige, besondere oder Folgeschäden aus der Nutzung
              des Dienstes.
            </p>

            <h2>9. Drittanbieterdienste</h2>
            <p>
              Der Dienst kann mit Drittanbieter-Identitätsanbietern (Google,
              GitHub, Microsoft, Facebook, OIDC) integriert sein. Ihre Nutzung
              dieser Dienste unterliegt deren eigenen Bedingungen und
              Datenschutzerklärungen.
            </p>

            <h2>10. Anwendbares Recht</h2>
            <p>
              Diese Bedingungen unterliegen dem Recht des Großherzogtums
              Luxemburg. Für Streitigkeiten sind die Gerichte der Stadt
              Luxemburg ausschließlich zuständig.
            </p>

            <h2>11. Änderungen</h2>
            <p>
              Wir können diese Bedingungen aktualisieren. Die weitere Nutzung
              nach Veröffentlichung der Änderungen gilt als Zustimmung.
            </p>

            <h2>12. Kontakt</h2>
            <p>
              {{ siteName }} &mdash;
              <a :href="'mailto:' + contactEmail">{{ contactEmail }}</a>
            </p>
          </v-card-text>
        </v-card>
      </v-tabs-window-item>
    </v-tabs-window>
  </v-sheet>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'TermsOfService',
  setup() {
    const selectedLanguage = ref('en')
    const siteName = import.meta.env.VITE_SITE_NAME || 'This Service'
    const siteUrl = import.meta.env.VITE_SITE_URL || '#'
    const contactEmail =
      import.meta.env.VITE_CONTACT_EMAIL || 'contact@example.com'
    return { selectedLanguage, siteName, siteUrl, contactEmail }
  }
})
</script>
