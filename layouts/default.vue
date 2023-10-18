<template>
    <div class="flex flex-col border h-screen">
        <div class="">
            <Header/>
        </div>

        <main class="flex-grow ">
            <!-- <slot/> -->
            <Content>
                <slot/>
            </Content>
        </main>
    </div>
</template>