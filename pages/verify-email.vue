<script setup lang="ts">
const router = useRouter();
const gotoLoginPage = (): void => {
    router.push('/');
}
</script>

<template>
    <div class="verify-email">
        <div class="inner-verify-email">
            <p class="p-title">Confirm Your Email</p>
            <p class="p-contents">
                Thank you for signing up. We have sent a confirmation email to the address you provided.
                <br>
                Please check your inbox and follow the instructions to verify your email address.
                <br>
                Once your email is verified, you will be able to log in and access your account.
            </p>
            
            <button class="btn-to-login" @click="gotoLoginPage">
                Go to Login Page
            </button>
        </div>
    </div>
</template>

<style scoped>
.verify-email {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    height: 90vh;
}
.p-title {
    font-size: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(100, 100, 100, 0.2);
}
.p-contents {
    line-height: 2.5rem;
    margin-bottom: 2rem;
}
.btn-to-login {
    margin: 0.1rem;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    font-weight: bold;
    
    border: 3px solid rgba(0, 100, 200, 0.822);
    text-decoration: none;
}
.btn-to-login:hover {
    opacity: 0.7;
    transition: 0.3s;
    background-color: rgba(0, 100, 200);
    color: aliceblue;
}
</style>
