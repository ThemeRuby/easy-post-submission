<script>
  import { ref, watch, onMounted } from 'vue'

  export default {
    name: 'recaptchaContent',
    props: {
      siteKey: {
        type: String,
        required: true
      },
      shouldLoadRecaptcha: {
        type: Boolean,
        required: false
      }
    },

    setup(props, { emit }) {
      const recaptchaInstance = ref(null)
      const translate = rbGlobalSubmissionSettings.translate

      const getText = (key) => {
        return translate[key] || key
      }

      watch(
        () => props.shouldLoadRecaptcha,
        (newVal) => {
          if (newVal) {
            loadRecaptcha()
          }
        }
      )

      onMounted(() => {
        if (props.shouldLoadRecaptcha) {
          loadRecaptcha()
        }
      })

      const loadRecaptcha = () => {
        if (!document.getElementById('recaptcha-script')) {
          const script = document.createElement('script')
          script.id = 'recaptcha-script'
          script.src = 'https://www.google.com/recaptcha/api.js?render=explicit'
          script.onload = () =>
            waitForGrecaptcha().then(() => renderRecaptcha())
          script.async = true
          script.defer = true
          document.head.appendChild(script)
        } else {
          waitForGrecaptcha().then(() => renderRecaptcha())
        }
      }

      const waitForGrecaptcha = () => {
        return new Promise((resolve, reject) => {
          const interval = setInterval(() => {
            if (typeof grecaptcha.render !== 'undefined') {
              clearInterval(interval)
              resolve()
            }
          }, 50)

          setTimeout(() => {
            clearInterval(interval)
            reject(getText('recaptchaLoadFailed'))
          }, 5000)
        })
      }

      const renderRecaptcha = () => {
        if (props.siteKey !== '') {
          recaptchaInstance.value = grecaptcha.render(
            document.querySelector('.g-recaptcha'),
            {
              sitekey: props.siteKey,
              callback: onVerify,
              'expired-callback': onExpired
            }
          )
        }
      }

      const onVerify = (response) => {
        emit('verified', response)
      }

      const onExpired = () => {
        emit('data-expired-callback')
      }

      const resetRecaptcha = () => {
        if (recaptchaInstance.value !== null) {
          grecaptcha.reset(recaptchaInstance.value)
        }
      }

      return {
        recaptchaInstance,
        loadRecaptcha,
        resetRecaptcha,
        onVerify
      }
    }
  }
</script>
<template>
  <div
    :data-callback="onVerify"
    :data-sitekey="siteKey"
    class="g-recaptcha"
  ></div>
</template>
