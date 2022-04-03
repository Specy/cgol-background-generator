<script>
    export let title = ''
    export let style = ''
</script>


<div class='column-wrapper' {style}>
    <h1>{title}</h1>
    <div class="column">
        <slot></slot>
    </div>
</div>

<style>
    .column-wrapper{
        display: flex;
        flex-direction: column;
        margin-bottom: 0;
        color: var(--controls-background-text);
    }
    .column{
        display: flex;
        margin: 1rem;
        gap: 0.8rem;
        flex-direction: column;
    }
</style>