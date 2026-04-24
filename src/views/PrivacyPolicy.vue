<template>
  <v-tabs v-model="selectedLanguage" grow slider-color="yellow">
    <v-tab value="en" ripple>en</v-tab>
    <v-tab value="fr" ripple>fr</v-tab>
    <v-tab value="de" ripple>de</v-tab>
    <v-window v-model="selectedLanguage">
      <!-- ═══════════════════════════════════════════════════════════ ENGLISH -->
      <v-window-item value="en">
        <v-card flat>
          <v-card-text class="text-xs-left">
            <h1>Privacy Policy</h1>
            <p>Effective date: April 24, 2026</p>

            <p>
              {{ siteName }} (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
              &ldquo;our&rdquo;) operates {{ siteUrl }} (the
              &ldquo;Service&rdquo;). This policy explains how we collect, use
              and protect your personal data in accordance with Regulation (EU)
              2016/679 (GDPR).
            </p>

            <h2>Definitions</h2>
            <ul>
              <li>
                <strong>Service</strong> &mdash; {{ siteUrl }} operated by
                {{ siteName }}.
              </li>
              <li>
                <strong>Personal Data</strong> &mdash; data about a living
                individual who can be identified from those data.
              </li>
              <li>
                <strong>Data Controller</strong> &mdash; the entity that
                determines the purposes and means of processing personal data.
                For this Service, that is {{ siteName }}.
              </li>
            </ul>

            <h2>Information We Collect</h2>
            <ul>
              <li>
                <strong>Account data:</strong> username and e-mail address, used
                as your primary identifier and for account recovery.
              </li>
              <li>
                <strong>OAuth connection data:</strong> when you log in via a
                third-party provider (Google, GitHub, Microsoft, Facebook, or a
                generic OIDC provider) we store the provider name, your
                provider-side user ID, display name, profile URL, avatar URL,
                and a short-lived access token. Your provider&rsquo;s own
                privacy policy governs data exchanged during the redirect.
              </li>
              <li>
                <strong>Uploaded files:</strong> images or other files you
                voluntarily upload during an event.
              </li>
              <li>
                <strong>Audit log:</strong> timestamps and descriptions of
                significant actions linked to your username. Your username is
                nulled when your account is deleted; the log itself is retained
                for operational integrity.
              </li>
            </ul>
            <p>
              We do <strong>not</strong> collect phone numbers, IP addresses,
              device identifiers, or any analytics or tracking data.
            </p>

            <h2>Cookies</h2>
            <p>
              This Service uses <strong>strictly necessary</strong> HttpOnly
              cookies only. All cookies are required for authentication; the
              Service cannot function without them. Because no non-essential
              cookies are set, no consent banner is displayed.
            </p>
            <v-table density="compact">
              <thead>
                <tr>
                  <th>Cookie</th>
                  <th>Purpose</th>
                  <th>Lifetime</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>access_token</code></td>
                  <td>
                    Signed JWT authenticating your session. Read by the server
                    on every request; never accessible to JavaScript.
                  </td>
                  <td>15 minutes</td>
                </tr>
                <tr>
                  <td><code>refresh_token</code></td>
                  <td>
                    Long-lived JWT used solely to issue a new access token
                    without requiring you to log in again.
                  </td>
                  <td>7 days</td>
                </tr>
                <tr>
                  <td><code>pkce_state</code></td>
                  <td>
                    Transient PKCE state carried across the OAuth redirect
                    round-trip. Deleted immediately after use.
                  </td>
                  <td>10 minutes</td>
                </tr>
              </tbody>
            </v-table>

            <h2>Use of Data</h2>
            <ul>
              <li>To provide and maintain the Service.</li>
              <li>To authenticate you and maintain your session.</li>
              <li>To enable you to participate in events and track scores.</li>
              <li>To detect and address technical issues.</li>
            </ul>

            <h2>Legal Basis for Processing (GDPR)</h2>
            <ul>
              <li>
                Account data and cookies: <em>contract performance</em>
                (Art.&nbsp;6(1)(b)) &mdash; necessary to provide the Service.
              </li>
              <li>
                Audit log: <em>legitimate interests</em>
                (Art.&nbsp;6(1)(f)) &mdash; operational integrity and fraud
                prevention.
              </li>
            </ul>

            <h2>Retention of Data</h2>
            <p>
              Personal data is retained only as long as necessary for the
              purposes described. Account data is retained until you delete your
              account. Audit log entries are retained indefinitely in anonymised
              form. See our full
              <a :href="backendUrl + '/legal/data-retention'" target="_blank"
                >Data Retention Statement</a
              >.
            </p>

            <h2>Transfer of Data</h2>
            <p>
              Data is stored and processed in Luxembourg. We do not transfer
              personal data to countries outside the EEA except as required by
              the OAuth flows described above, which are governed by the
              respective provider&rsquo;s policies.
            </p>

            <h2>Your GDPR Rights</h2>
            <ul>
              <li>
                <strong>Access &amp; portability:</strong> request a copy of
                your data by contacting us.
              </li>
              <li>
                <strong>Rectification:</strong> contact us to correct inaccurate
                data.
              </li>
              <li>
                <strong>Erasure (right to be forgotten):</strong> you can
                permanently delete your account from the
                <router-link to="/account">Account Settings</router-link> page
                at any time, or contact us at
                <a :href="'mailto:' + contactEmail">{{ contactEmail }}</a
                >.
              </li>
              <li>
                <strong>Restriction &amp; objection:</strong> contact us to
                restrict or object to processing.
              </li>
              <li>
                <strong>Withdraw consent:</strong> where processing is based on
                consent, you may withdraw it at any time.
              </li>
              <li>
                <strong>Lodge a complaint:</strong> you may complain to the
                <em
                  >Commission Nationale pour la Protection des
                  Donn&eacute;es</em
                >
                (CNPD), Luxembourg&rsquo;s data protection authority, or the
                authority of your country of residence.
              </li>
            </ul>

            <h2>Children&rsquo;s Privacy</h2>
            <p>
              The Service is not directed at persons under 18. We do not
              knowingly collect data from children. Contact us if you believe a
              child has provided data.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              We may update this policy. The effective date above will be
              updated and we will notify users of material changes via the
              Service.
            </p>

            <h2>Contact Us</h2>
            <p>
              {{ siteName }} &mdash;
              <a :href="'mailto:' + contactEmail">{{ contactEmail }}</a>
            </p>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- ══════════════════════════════════════════════════════════ FRANÇAIS -->
      <v-window-item value="fr">
        <v-card flat>
          <v-card-text class="text-xs-left">
            <h1>Politique de Confidentialité</h1>
            <p>Date de prise d'effet&nbsp;: 24 avril 2026</p>

            <p>
              {{ siteName }} («&nbsp;nous&nbsp;») exploite {{ siteUrl }} (le
              «&nbsp;Service&nbsp;»). Cette politique explique comment nous
              collectons, utilisons et protégeons vos données personnelles
              conformément au Règlement (UE) 2016/679 (RGPD).
            </p>

            <h2>Définitions</h2>
            <ul>
              <li>
                <strong>Service</strong> &mdash; {{ siteUrl }} exploité par
                {{ siteName }}.
              </li>
              <li>
                <strong>Données à caractère personnel</strong> &mdash; données
                concernant une personne vivante identifiable.
              </li>
              <li>
                <strong>Responsable du traitement</strong> &mdash; entité
                déterminant les finalités et modalités du traitement. Pour ce
                Service&nbsp;: {{ siteName }}.
              </li>
            </ul>

            <h2>Données collectées</h2>
            <ul>
              <li>
                <strong>Données de compte&nbsp;:</strong> nom d'utilisateur et
                adresse e-mail, utilisés comme identifiant principal et pour la
                récupération de compte.
              </li>
              <li>
                <strong>Données de connexion OAuth&nbsp;:</strong> lors d'une
                connexion via un fournisseur tiers (Google, GitHub, Microsoft,
                Facebook ou OIDC générique), nous stockons le nom du
                fournisseur, votre identifiant chez ce fournisseur, votre nom
                d'affichage, URL de profil, URL d'avatar et un jeton d'accès de
                courte durée. La politique de confidentialité du fournisseur
                régit les données échangées lors de la redirection.
              </li>
              <li>
                <strong>Fichiers téléversés&nbsp;:</strong> images ou fichiers
                que vous déposez volontairement lors d'un événement.
              </li>
              <li>
                <strong>Journal d'audit&nbsp;:</strong> horodatages et
                descriptions d'actions significatives liés à votre nom
                d'utilisateur. Ce champ est mis à NULL lors de la suppression du
                compte&nbsp;; le journal est conservé pour l'intégrité
                opérationnelle.
              </li>
            </ul>
            <p>
              Nous ne collectons <strong>pas</strong> de numéros de téléphone,
              adresses IP, identifiants de dispositifs ni données d'analyse ou
              de traçage.
            </p>

            <h2>Cookies</h2>
            <p>
              Ce Service utilise uniquement des cookies
              <strong>strictement nécessaires</strong> de type HttpOnly. Aucune
              bannière de consentement n'est affichée car aucun cookie non
              essentiel n'est déposé.
            </p>
            <v-table density="compact">
              <thead>
                <tr>
                  <th>Cookie</th>
                  <th>Finalité</th>
                  <th>Durée</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>access_token</code></td>
                  <td>
                    JWT signé authentifiant votre session. Lu par le serveur à
                    chaque requête&nbsp;; inaccessible au JavaScript.
                  </td>
                  <td>15 minutes</td>
                </tr>
                <tr>
                  <td><code>refresh_token</code></td>
                  <td>
                    JWT longue durée utilisé uniquement pour émettre un nouveau
                    jeton d'accès sans reconnexion.
                  </td>
                  <td>7 jours</td>
                </tr>
                <tr>
                  <td><code>pkce_state</code></td>
                  <td>
                    État PKCE transitoire transmis lors de la redirection OAuth.
                    Supprimé immédiatement après utilisation.
                  </td>
                  <td>10 minutes</td>
                </tr>
              </tbody>
            </v-table>

            <h2>Utilisation des données</h2>
            <ul>
              <li>Pour fournir et maintenir le Service.</li>
              <li>Pour vous authentifier et maintenir votre session.</li>
              <li>
                Pour vous permettre de participer aux événements et suivre les
                scores.
              </li>
              <li>Pour détecter et résoudre les problèmes techniques.</li>
            </ul>

            <h2>Base juridique du traitement (RGPD)</h2>
            <ul>
              <li>
                Données de compte et cookies&nbsp;:
                <em>exécution d'un contrat</em> (Art.&nbsp;6(1)(b)) &mdash;
                nécessaire à la fourniture du Service.
              </li>
              <li>
                Journal d'audit&nbsp;: <em>intérêts légitimes</em>
                (Art.&nbsp;6(1)(f)) &mdash; intégrité opérationnelle et
                prévention des fraudes.
              </li>
            </ul>

            <h2>Conservation des données</h2>
            <p>
              Les données personnelles sont conservées uniquement le temps
              nécessaire aux finalités décrites. Les données de compte sont
              conservées jusqu'à la suppression du compte. Les entrées du
              journal d'audit sont conservées indéfiniment sous forme
              anonymisée. Voir notre
              <a :href="backendUrl + '/legal/data-retention'" target="_blank"
                >Déclaration de conservation des données</a
              >.
            </p>

            <h2>Transfert des données</h2>
            <p>
              Les données sont stockées et traitées au Luxembourg. Aucun
              transfert de données personnelles hors de l'EEE n'a lieu, sauf
              dans le cadre des flux OAuth décrits ci-dessus, régis par les
              politiques des fournisseurs respectifs.
            </p>

            <h2>Vos droits RGPD</h2>
            <ul>
              <li>
                <strong>Accès et portabilité&nbsp;:</strong> contactez-nous pour
                obtenir une copie de vos données.
              </li>
              <li>
                <strong>Rectification&nbsp;:</strong> contactez-nous pour
                corriger des données inexactes.
              </li>
              <li>
                <strong>Effacement (droit à l'oubli)&nbsp;:</strong> vous pouvez
                supprimer définitivement votre compte depuis la page
                <router-link to="/account">Paramètres du compte</router-link>
                ou en nous contactant à
                <a :href="'mailto:' + contactEmail">{{ contactEmail }}</a
                >.
              </li>
              <li>
                <strong>Limitation et opposition&nbsp;:</strong> contactez-nous
                pour demander la limitation du traitement ou vous y opposer.
              </li>
              <li>
                <strong>Retrait du consentement&nbsp;:</strong> lorsque le
                traitement est fondé sur votre consentement, vous pouvez le
                retirer à tout moment.
              </li>
              <li>
                <strong>Réclamation&nbsp;:</strong> vous pouvez déposer une
                plainte auprès de la
                <em
                  >Commission Nationale pour la Protection des
                  Donn&eacute;es</em
                >
                (CNPD) ou de l'autorité de votre pays de résidence.
              </li>
            </ul>

            <h2>Vie privée des enfants</h2>
            <p>
              Le Service n'est pas destiné aux personnes de moins de 18 ans.
              Contactez-nous si vous pensez qu'un enfant nous a fourni des
              données.
            </p>

            <h2>Modifications</h2>
            <p>
              Nous pouvons mettre à jour cette politique. La date d'effet sera
              actualisée et les modifications substantielles seront notifiées
              aux utilisateurs.
            </p>

            <h2>Nous contacter</h2>
            <p>
              {{ siteName }} &mdash;
              <a :href="'mailto:' + contactEmail">{{ contactEmail }}</a>
            </p>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- ══════════════════════════════════════════════════════════ DEUTSCH -->
      <v-window-item value="de">
        <v-card flat>
          <v-card-text class="text-xs-left">
            <h1>Datenschutzerklärung</h1>
            <p>Datum des Inkrafttretens: 24. April 2026</p>

            <p>
              {{ siteName }} («wir», «uns», «unser») betreibt {{ siteUrl }} (den
              «Dienst»). Diese Erklärung beschreibt, wie wir Ihre
              personenbezogenen Daten gemäß der Verordnung (EU) 2016/679 (DSGVO)
              erheben, verwenden und schützen.
            </p>

            <h2>Begriffsbestimmungen</h2>
            <ul>
              <li>
                <strong>Dienst</strong> &mdash; {{ siteUrl }} betrieben von
                {{ siteName }}.
              </li>
              <li>
                <strong>Personenbezogene Daten</strong> &mdash; Daten, die sich
                auf eine identifizierbare lebende Person beziehen.
              </li>
              <li>
                <strong>Verantwortlicher</strong> &mdash; die Stelle, die Zweck
                und Mittel der Verarbeitung bestimmt. Für diesen Dienst:
                {{ siteName }}.
              </li>
            </ul>

            <h2>Erhobene Daten</h2>
            <ul>
              <li>
                <strong>Kontodaten:</strong> Benutzername und E-Mail-Adresse als
                Hauptidentifikator und zur Kontowiederherstellung.
              </li>
              <li>
                <strong>OAuth-Verbindungsdaten:</strong> Bei Anmeldung über
                einen Drittanbieter (Google, GitHub, Microsoft, Facebook oder
                einen generischen OIDC-Anbieter) speichern wir Anbietername,
                Ihre Benutzer-ID beim Anbieter, Anzeigename, Profil-URL,
                Avatar-URL und ein kurzlebiges Zugriffstoken. Die
                Datenschutzerklärung des Anbieters gilt für die beim Redirect
                ausgetauschten Daten.
              </li>
              <li>
                <strong>Hochgeladene Dateien:</strong> Bilder oder andere
                Dateien, die Sie während einer Veranstaltung freiwillig
                hochladen.
              </li>
              <li>
                <strong>Audit-Log:</strong> Zeitstempel und Beschreibungen
                wesentlicher Aktionen, verknüpft mit Ihrem Benutzernamen. Der
                Benutzername wird bei Kontolöschung auf NULL gesetzt; der Log
                bleibt aus betrieblichen Gründen erhalten.
              </li>
            </ul>
            <p>
              Wir erheben <strong>keine</strong> Telefonnummern, IP-Adressen,
              Gerätekennungen oder Analyse- und Tracking-Daten.
            </p>

            <h2>Cookies</h2>
            <p>
              Dieser Dienst verwendet ausschließlich
              <strong>technisch notwendige</strong> HttpOnly-Cookies. Da keine
              nicht notwendigen Cookies gesetzt werden, wird kein
              Cookie-Einwilligungsbanner angezeigt.
            </p>
            <v-table density="compact">
              <thead>
                <tr>
                  <th>Cookie</th>
                  <th>Zweck</th>
                  <th>Lebensdauer</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>access_token</code></td>
                  <td>
                    Signiertes JWT zur Sitzungsauthentifizierung. Wird vom
                    Server bei jeder Anfrage gelesen; für JavaScript nicht
                    zugänglich.
                  </td>
                  <td>15 Minuten</td>
                </tr>
                <tr>
                  <td><code>refresh_token</code></td>
                  <td>
                    Langlebiges JWT, das ausschließlich zum Ausstellen eines
                    neuen Zugriffstokens ohne erneute Anmeldung dient.
                  </td>
                  <td>7 Tage</td>
                </tr>
                <tr>
                  <td><code>pkce_state</code></td>
                  <td>
                    Transienter PKCE-Zustand für den OAuth-Redirect. Wird
                    unmittelbar nach Verwendung gelöscht.
                  </td>
                  <td>10 Minuten</td>
                </tr>
              </tbody>
            </v-table>

            <h2>Datennutzung</h2>
            <ul>
              <li>Bereitstellung und Betrieb des Dienstes.</li>
              <li>Authentifizierung und Sitzungsverwaltung.</li>
              <li>
                Ermöglichung der Teilnahme an Veranstaltungen und
                Ergebnisverfolgung.
              </li>
              <li>Erkennung und Behebung technischer Probleme.</li>
            </ul>

            <h2>Rechtsgrundlage der Verarbeitung (DSGVO)</h2>
            <ul>
              <li>
                Kontodaten und Cookies:
                <em>Vertragserfüllung</em> (Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b)
                &mdash; zur Erbringung des Dienstes erforderlich.
              </li>
              <li>
                Audit-Log: <em>berechtigte Interessen</em>
                (Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f) &mdash; Betriebsintegrität
                und Betrugsvorbeugung.
              </li>
            </ul>

            <h2>Aufbewahrung von Daten</h2>
            <p>
              Personenbezogene Daten werden nur so lange gespeichert, wie es für
              die genannten Zwecke erforderlich ist. Kontodaten werden bis zur
              Löschung Ihres Kontos aufbewahrt. Audit-Log-Einträge werden
              dauerhaft in anonymisierter Form gespeichert. Siehe unsere
              <a :href="backendUrl + '/legal/data-retention'" target="_blank"
                >Datenspeicherungserklärung</a
              >.
            </p>

            <h2>Datenübermittlung</h2>
            <p>
              Daten werden in Luxemburg gespeichert und verarbeitet. Eine
              Übermittlung personenbezogener Daten außerhalb des EWR findet
              nicht statt, außer im Rahmen der beschriebenen OAuth-Flows, die
              den Datenschutzerklärungen der jeweiligen Anbieter unterliegen.
            </p>

            <h2>Ihre Rechte nach der DSGVO</h2>
            <ul>
              <li>
                <strong>Auskunft und Portabilität:</strong> Fordern Sie eine
                Kopie Ihrer Daten an.
              </li>
              <li>
                <strong>Berichtigung:</strong> Kontaktieren Sie uns, um
                unrichtige Daten korrigieren zu lassen.
              </li>
              <li>
                <strong>Löschung (Recht auf Vergessenwerden):</strong> Sie
                können Ihr Konto jederzeit über die
                <router-link to="/account">Kontoeinstellungen</router-link>
                dauerhaft löschen oder uns unter
                <a :href="'mailto:' + contactEmail">{{ contactEmail }}</a>
                kontaktieren.
              </li>
              <li>
                <strong>Einschränkung und Widerspruch:</strong> Kontaktieren Sie
                uns, um die Verarbeitung einzuschränken oder ihr zu
                widersprechen.
              </li>
              <li>
                <strong>Widerruf der Einwilligung:</strong> Soweit die
                Verarbeitung auf Ihrer Einwilligung beruht, können Sie diese
                jederzeit widerrufen.
              </li>
              <li>
                <strong>Beschwerde:</strong> Sie können eine Beschwerde bei der
                <em
                  >Commission Nationale pour la Protection des
                  Donn&eacute;es</em
                >
                (CNPD) oder der Aufsichtsbehörde Ihres Wohnsitzlandes
                einreichen.
              </li>
            </ul>

            <h2>Kinder</h2>
            <p>
              Der Dienst richtet sich nicht an Personen unter 18 Jahren.
              Kontaktieren Sie uns, falls Sie der Meinung sind, dass ein Kind
              uns Daten übermittelt hat.
            </p>

            <h2>Änderungen</h2>
            <p>
              Wir können diese Erklärung aktualisieren. Das Datum des
              Inkrafttretens wird dann geändert; wesentliche Änderungen werden
              den Nutzern über den Dienst mitgeteilt.
            </p>

            <h2>Kontakt</h2>
            <p>
              {{ siteName }} &mdash;
              <a :href="'mailto:' + contactEmail">{{ contactEmail }}</a>
            </p>
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>
  </v-tabs>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'PrivacyPolicy',
  setup() {
    const selectedLanguage = ref('en')
    const siteName = import.meta.env.VITE_SITE_NAME || 'This Service'
    const siteUrl = import.meta.env.VITE_SITE_URL || '#'
    const contactEmail =
      import.meta.env.VITE_CONTACT_EMAIL || 'contact@example.com'
    const backendUrl = import.meta.env.VITE_BACKEND_URL || ''
    return { selectedLanguage, siteName, siteUrl, contactEmail, backendUrl }
  }
})
</script>
