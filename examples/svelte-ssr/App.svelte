<script>
	export let title;
    export let htmlString;
    export let url;
</script>

<svelte:head>
    <title>{title}</title>
    <meta name="keyword" content="svelte,ssr">
    <meta name="description" content="svelte ssr demo">
    <html lang="en" />
</svelte:head>

<h1>{title}</h1>
{@html htmlString}
<div>The visited URL is: { url }</div>`