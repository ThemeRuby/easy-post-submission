<script>
  export default {
    name: 'helpContent',
    props: {
      getText: {
        type: Function,
        required: true
      }
    },
    setup() {
      const copyToClipboard = (event) => {
        const text = event.target.innerText || event.target.textContent
        navigator.clipboard
          .writeText(text)
          .then(() => {
            showCopyPopup(event)
          })
          .catch((error) => {
            console.error('Failed to copy text: ', error)
          })
      }

      const showCopyPopup = (event) => {
        const existingPopup = document.querySelector('.copy-popup')

        if (existingPopup) {
          existingPopup.remove()
        }

        const popup = document.createElement('div')
        popup.textContent = translate.copied
        popup.classList.add('copy-popup')
        popup.style.position = 'absolute'
        popup.style.top = `${event.clientY + 10}px`
        popup.style.left = `${event.clientX + 10}px`
        popup.style.backgroundColor = '#000'
        popup.style.color = '#fff'
        popup.style.padding = '5px 10px'
        popup.style.borderRadius = '5px'
        popup.style.fontSize = '12px'
        popup.style.zIndex = '9999'
        popup.style.opacity = '0'
        document.body.appendChild(popup)

        let opacity = 0
        let interval = setInterval(() => {
          opacity += 0.05
          popup.style.opacity = opacity

          if (opacity >= 1) {
            clearInterval(interval)
          }
        }, 30)

        setTimeout(() => {
          let fadeOutOpacity = 1
          let fadeOutInterval = setInterval(() => {
            fadeOutOpacity -= 0.05
            popup.style.opacity = fadeOutOpacity

            if (fadeOutOpacity <= 0) {
              clearInterval(fadeOutInterval)
              popup.remove()
            }
          }, 30)
        }, 1500)
      }

      const docsButtonClick = () => {
        window.open(
          'https://docs.themeruby.com/easy-post-submission/',
          '_blank'
        )
      }

      return { copyToClipboard, docsButtonClick }
    }
  }
</script>
<template>
  <div class="rbsm-fullwidth">
    <v-card class="rbsm-card" elevation="0">
      <p class="rbsm-settings-title bottom-spacing-20">
        <v-icon>mdi-code-array</v-icon>
        {{ getText('usefulShortcodes') }}
      </p>
      <v-col class="shortcode-helper bottom-spacing-20" cols="12">
        <h3 class="rbsm-form-name">
          <v-icon>mdi-code-brackets</v-icon>
          {{ getText('displaySubmitPostFormFrontend') }}
        </h3>
        <p ref="shortcode" class="rbsm-form-code" @click="copyToClipboard">
          [easy_post_submission_form id=1]
        </p>
        <p>{{ getText('placeSubmitShortcode') }}</p>
      </v-col>
      <v-col class="shortcode-helper bottom-spacing-20" cols="12">
        <h3 class="rbsm-form-name">
          <v-icon>mdi-code-brackets</v-icon>
          {{ getText('displayListPostSubmissions') }}
        </h3>
        <p ref="shortcode" class="rbsm-form-code" @click="copyToClipboard">
          [easy_post_submission_manager]
        </p>
        <p>{{ getText('placeProfileShortcode') }}</p>
      </v-col>

      <v-col class="shortcode-helper bottom-spacing-20" cols="12">
        <h3 class="rbsm-form-name">
          <v-icon>mdi-code-brackets</v-icon>
          {{ getText('displayEditForm') }}
        </h3>
        <p ref="shortcode" class="rbsm-form-code" @click="copyToClipboard">
          [easy_post_submission_edit]
        </p>
        <p>{{ getText('placeEditShortcode') }}</p>
      </v-col>
      <v-col class="shortcode-helper doc-helper" cols="12">
        <h3 class="rbsm-form-name">
          <v-icon>mdi-book-open-variant</v-icon>
          {{ getText('documentsInfo') }}
        </h3>
        <button
          class="rbsm-black-btn rbsm-transition rbsm-access-btn rbsm-docs-btn"
          @click="docsButtonClick"
        >
          <v-icon>mdi-file-document</v-icon>
          {{ getText('learnMore') }}
        </button>
      </v-col>
    </v-card>
  </div>
  <div class="rbsm-fullwidth">
    <v-card class="rbsm-card" elevation="0">
      <p class="rbsm-settings-title">
        <v-icon>mdi-wordpress</v-icon>
        {{ getText('premiumTitle') }}
      </p>
      <div class="rbsm-rec-cards">
        <div class="rbsm-rec-card">
          <a
            class="rbsm-rec-image"
            href="//1.envato.market/MXYjYo"
            rel="nofollow"
            target="_blank"
          >
            <img
              alt="Foxiz Theme"
              height="300"
              src="//api.themeruby.com/images/foxiz.jpg"
              width="590"
            />
          </a>
          <div class="rbsm-rec-content">
            <h2>{{ getText('foxizThemeTitle') }}</h2>
            <p class="rbsm-rec-tagline">{{ getText('foxizTagline') }}</p>
            <a
              class="rbsm-black-btn rbsm-transition rbsm-access-btn"
              href="//1.envato.market/MXYjYo"
              rel="nofollow"
              target="_blank"
            >
              {{ getText('learnMore') }}
              <v-icon>mdi-arrow-right-thin</v-icon>
            </a>
          </div>
        </div>
        <div class="rbsm-rec-card">
          <a
            class="rbsm-rec-image"
            href="//1.envato.market/Z25Rz"
            rel="nofollow"
            target="_blank"
          >
            <img
              alt="Pixwell Theme"
              height="300"
              src="//api.themeruby.com/images/pixwell.jpg"
              width="590"
            />
          </a>
          <div class="rbsm-rec-content">
            <h2>{{ getText('pixwellThemeTitle') }}</h2>
            <p class="rbsm-rec-tagline">{{ getText('pixwellTagline') }}</p>
            <a
              class="rbsm-black-btn rbsm-transition rbsm-access-btn"
              href="//1.envato.market/Z25Rz"
              rel="nofollow"
              target="_blank"
            >
              {{ getText('learnMore') }}
              <v-icon>mdi-arrow-right-thin</v-icon>
            </a>
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>
