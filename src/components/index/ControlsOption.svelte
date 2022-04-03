<script>
    export let name = ''
    export let style = ''
</script>


<div {style}>
    {#if name}
        <h3>{name}</h3>
    {/if}
    <slot></slot>
</div>


<style>
    div{
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-wrap: wrap;
    }
    h3{
        margin-right: 0.6rem;
    }
</style>